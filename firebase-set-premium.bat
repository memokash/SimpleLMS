@echo off
REM Firebase CLI script to set user to premium tier
REM Usage: firebase-set-premium.bat <userEmail>

if "%1"=="" (
    echo Usage: firebase-set-premium.bat ^<userEmail^>
    exit /b 1
)

set USER_EMAIL=%1

echo Setting premium tier for user: %USER_EMAIL%

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    exit /b 1
)

REM Use Firebase Admin SDK via Node.js
echo const admin = require('firebase-admin'); > temp-set-premium.js
echo const serviceAccount = require('./firebase-service-account.json'); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo admin.initializeApp({ >> temp-set-premium.js
echo   credential: admin.credential.cert(serviceAccount) >> temp-set-premium.js
echo }); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo const db = admin.firestore(); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo async function setPremiumTier(userEmail) { >> temp-set-premium.js
echo   try { >> temp-set-premium.js
echo     // Find user by email >> temp-set-premium.js
echo     const usersSnapshot = await db.collection('users') >> temp-set-premium.js
echo       .where('email', '==', userEmail) >> temp-set-premium.js
echo       .limit(1) >> temp-set-premium.js
echo       .get(); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     if (usersSnapshot.empty) { >> temp-set-premium.js
echo       console.error(`No user found with email: ${userEmail}`); >> temp-set-premium.js
echo       process.exit(1); >> temp-set-premium.js
echo     } >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     const userDoc = usersSnapshot.docs[0]; >> temp-set-premium.js
echo     const userId = userDoc.id; >> temp-set-premium.js
echo     const userData = userDoc.data(); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     console.log(`Found user: ${userData.displayName ^|^| userData.email}`); >> temp-set-premium.js
echo     console.log(`Current tier: ${userData.subscriptionTier ^|^| 'free'}`); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     // Update user to premium tier >> temp-set-premium.js
echo     await db.collection('users').doc(userId).update({ >> temp-set-premium.js
echo       subscriptionTier: 'premium', >> temp-set-premium.js
echo       subscriptionStatus: 'active', >> temp-set-premium.js
echo       subscriptionCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), >> temp-set-premium.js
echo       updatedAt: new Date() >> temp-set-premium.js
echo     }); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     console.log('Successfully updated user to premium tier!'); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     // Also create/update subscription document for backward compatibility >> temp-set-premium.js
echo     await db.collection('subscriptions').doc(userId).set({ >> temp-set-premium.js
echo       plan: 'premium', >> temp-set-premium.js
echo       status: 'active', >> temp-set-premium.js
echo       currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), >> temp-set-premium.js
echo       updatedAt: new Date() >> temp-set-premium.js
echo     }, { merge: true }); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     console.log('Subscription document updated!'); >> temp-set-premium.js
echo     console.log('User can now access all premium features including quizzes.'); >> temp-set-premium.js
echo. >> temp-set-premium.js
echo     process.exit(0); >> temp-set-premium.js
echo   } catch (error) { >> temp-set-premium.js
echo     console.error('Error setting premium tier:', error); >> temp-set-premium.js
echo     process.exit(1); >> temp-set-premium.js
echo   } >> temp-set-premium.js
echo } >> temp-set-premium.js
echo. >> temp-set-premium.js
echo setPremiumTier('%USER_EMAIL%'); >> temp-set-premium.js

REM Run the script
node temp-set-premium.js

REM Clean up
del temp-set-premium.js

echo Done!