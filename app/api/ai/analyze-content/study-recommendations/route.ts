import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(['Test recommendation']);
}