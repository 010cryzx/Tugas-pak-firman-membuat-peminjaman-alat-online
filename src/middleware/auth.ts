import { NextRequest } from 'next/server';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser, getUserByUid } from '../db/repository.ts';

export interface AuthenticatedActor {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: string;
  department: string;
  identityNumber: string;
}

export async function verifyRequestActor(req: NextRequest): Promise<AuthenticatedActor | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return null;
  }

  // Support institutional demo account session tokens (e.g. demo:demo-admin-01)
  if (token.startsWith('demo:')) {
    const demoUid = token.replace('demo:', '').trim();
    const dbUser = await getUserByUid(demoUid);
    if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
      return null;
    }
    return {
      id: dbUser.id,
      uid: dbUser.uid,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      department: dbUser.department,
      identityNumber: dbUser.identityNumber,
    };
  }

  // Verify real Firebase Auth ID token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const syncedUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || `${decodedToken.uid}@firebase.user`,
      decodedToken.name
    );
    return {
      id: syncedUser.id,
      uid: syncedUser.uid,
      name: syncedUser.name,
      email: syncedUser.email,
      role: syncedUser.role,
      department: syncedUser.department,
      identityNumber: syncedUser.identityNumber,
    };
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
