import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../../../../lib/firebase';
import { apiMiddleware, validation, addSecurityHeaders, addCorsHeaders } from '../../../../lib/authMiddleware';

// Rate limiting for file uploads
const UPLOAD_RATE_LIMIT = {
  limit: 3, // 3 uploads per 5 minutes
  windowMs: 5 * 60 * 1000 // 5 minutes
};

// File validation constants
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 1024; // 1KB minimum

/**
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(addSecurityHeaders(new NextResponse(null, { status: 200 })));
}

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware with stricter rate limiting for uploads
    const middlewareResult = await apiMiddleware(request, {
      requireAuth: true,
      requireEmailVerified: true,
      rateLimit: UPLOAD_RATE_LIMIT
    });

    // If middleware returned a response (error), return it
    if (middlewareResult instanceof NextResponse) {
      return addCorsHeaders(middlewareResult);
    }

    const { user } = middlewareResult;

    // Parse form data with error handling
    let formData: FormData;
    let file: File;
    
    try {
      formData = await request.formData();
      file = formData.get('file') as File;
    } catch (parseError) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid form data', code: 'INVALID_FORM_DATA' },
          { status: 400 }
        )
      ));
    }

    if (!file || !(file instanceof File)) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { error: 'No file provided', code: 'NO_FILE' },
          { status: 400 }
        )
      ));
    }

    // Security: Comprehensive file validation
    
    // 1. Validate file type (MIME type and extension)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
            code: 'INVALID_FILE_TYPE'
          },
          { status: 400 }
        )
      ));
    }

    // 2. Validate file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeToExt: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp']
    };

    if (!extension || !mimeToExt[file.type]?.includes(extension)) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'File extension does not match file type',
            code: 'EXTENSION_MISMATCH'
          },
          { status: 400 }
        )
      ));
    }

    // 3. Validate file size
    if (file.size < MIN_FILE_SIZE || file.size > MAX_FILE_SIZE) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: `File size must be between ${MIN_FILE_SIZE} bytes and ${MAX_FILE_SIZE / (1024*1024)}MB`,
            code: 'INVALID_FILE_SIZE'
          },
          { status: 400 }
        )
      ));
    }

    // 4. Validate filename contains no malicious characters
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Invalid filename. Only alphanumeric characters, dots, hyphens, and underscores are allowed.',
            code: 'INVALID_FILENAME'
          },
          { status: 400 }
        )
      ));
    }

    // Security: Generate safe, unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const safeFileName = `profile-${user!.uid}-${timestamp}-${random}.${extension}`;
    const storageRef = ref(storage, `profile-pictures/${user!.uid}/${safeFileName}`);

    // Read file content and validate it's actually an image
    let arrayBuffer: ArrayBuffer;
    let buffer: Uint8Array;
    
    try {
      arrayBuffer = await file.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
      
      // Basic image header validation
      const isValidImage = validateImageHeader(buffer, file.type);
      if (!isValidImage) {
        return addCorsHeaders(addSecurityHeaders(
          NextResponse.json(
            { 
              error: 'Invalid image file. File appears to be corrupted or not a valid image.',
              code: 'INVALID_IMAGE_FORMAT'
            },
            { status: 400 }
          )
        ));
      }
    } catch (fileError) {
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Failed to process file',
            code: 'FILE_PROCESSING_ERROR'
          },
          { status: 400 }
        )
      ));
    }

    // Check if user already has a profile picture and delete it
    try {
      const userDocRef = doc(db, 'profiles', user!.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data().profilePicture) {
        const oldUrl = userDoc.data().profilePicture;
        // Extract filename from URL and delete old file
        try {
          const oldPath = extractStoragePathFromUrl(oldUrl);
          if (oldPath) {
            const oldRef = ref(storage, oldPath);
            await deleteObject(oldRef);
          }
        } catch (deleteError) {
          // Log but don't fail upload if old image can't be deleted
          console.warn('Failed to delete old profile picture:', deleteError);
        }
      }
    } catch (checkError) {
      // Log but don't fail upload if we can't check for existing picture
      console.warn('Failed to check for existing profile picture:', checkError);
    }

    // Upload to Firebase Storage with metadata
    let uploadResult: any;
    let downloadURL: string;
    
    try {
      uploadResult = await uploadBytes(storageRef, buffer, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user!.uid,
          uploadedAt: new Date().toISOString(),
          originalName: file.name.substring(0, 100), // Limit length
          fileSize: file.size.toString()
        }
      });

      downloadURL = await getDownloadURL(uploadResult.ref);
    } catch (uploadError) {
      console.error('Firebase upload error:', uploadError);
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Failed to upload file to storage',
            code: 'STORAGE_UPLOAD_ERROR'
          },
          { status: 500 }
        )
      ));
    }

    // Update user profile in Firestore
    try {
      const userDocRef = doc(db, 'profiles', user!.uid);
      await updateDoc(userDocRef, {
        profilePicture: downloadURL,
        profilePictureUpdatedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (firestoreError) {
      // If Firestore update fails, try to clean up uploaded file
      try {
        await deleteObject(uploadResult.ref);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file after Firestore error:', cleanupError);
      }
      
      console.error('Firestore update error:', firestoreError);
      return addCorsHeaders(addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Failed to update user profile',
            code: 'DATABASE_UPDATE_ERROR'
          },
          { status: 500 }
        )
      ));
    }

    return addCorsHeaders(addSecurityHeaders(
      NextResponse.json({
        success: true,
        photoURL: downloadURL,
        message: 'Profile picture updated successfully'
      })
    ));

  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    // Security: Don't expose internal error details
    return addCorsHeaders(addSecurityHeaders(
      NextResponse.json(
        { 
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    ));
  }
}

/**
 * Validates image file header to ensure it's actually an image
 */
function validateImageHeader(buffer: Uint8Array, mimeType: string): boolean {
  if (buffer.length < 8) return false;

  const header = Array.from(buffer.slice(0, 8));
  
  switch (mimeType) {
    case 'image/jpeg':
      // JPEG: FF D8 FF
      return header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
    
    case 'image/png':
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      return header[0] === 0x89 && header[1] === 0x50 && 
             header[2] === 0x4E && header[3] === 0x47;
    
    case 'image/gif':
      // GIF: 47 49 46 38
      return header[0] === 0x47 && header[1] === 0x49 && 
             header[2] === 0x46 && header[3] === 0x38;
    
    case 'image/webp':
      // WebP: 52 49 46 46 ... 57 45 42 50
      return header[0] === 0x52 && header[1] === 0x49 && 
             header[2] === 0x46 && header[3] === 0x46;
    
    default:
      return false;
  }
}

/**
 * Extracts storage path from Firebase Storage URL
 */
function extractStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const match = path.match(/\/o\/(.+)\?/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}