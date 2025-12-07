'use server';

import {NextRequest, NextResponse} from 'next/server';
import * as crypto from 'crypto';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase'; // Firebase Admin setup

// ❗ SECURITY: Store your IPN secret in environment variables.
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || 'YOUR_IPN_SECRET_KEY';

/**
 * Activates a user's subscription in Firestore based on the order ID.
 * @param {string | number} orderId - The unique identifier for the order from NOWPayments.
 */
async function activateUserSubscription(orderId: string | number) {
  const { firestore } = initializeFirebase();
  console.log(`🔥 Activating subscription for orderId: ${orderId}`);

  // Find the user associated with this orderId
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('orderId', '==', orderId));
  
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log(`❌ No user found with orderId: ${orderId}.`);
    return;
  }

  // Assuming one user per orderId
  const userDoc = querySnapshot.docs[0];
  const userRef = userDoc.ref;
  const userData = userDoc.data();
  const requestedPlan = userData.requestedPlan; // 'Pro' or 'Yearly'

  if (!requestedPlan) {
    console.log(`❌ User ${userDoc.id} has no requested plan for order ${orderId}.`);
    return;
  }
  
  const PLAN_LIMITS = {
    Pro: { posts: { used: 0, total: 2000 }, images: { used: 0, total: 200 }, scripts: { used: 0, total: 50 }, agents: { used: 0, total: 5 } },
    Yearly: { posts: { used: 0, total: -1 }, images: { used: 0, total: -1 }, scripts: { used: 0, total: -1 }, agents: { used: 0, total: 10 } },
  };

  const newExpiryDate = new Date();
  if (requestedPlan === 'Pro') {
    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
  } else if (requestedPlan === 'Yearly') {
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
  }

  await updateDoc(userRef, {
    plan: requestedPlan,
    usage: (PLAN_LIMITS as any)[requestedPlan],
    currentPeriodEnd: newExpiryDate.toISOString(),
    orderId: null, // Clear the orderId after activation
    requestedPlan: null,
  });

  console.log(`✅ User ${userDoc.id} subscription activated to ${requestedPlan} for order ${orderId}`);
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-nowpayments-sig');
    const body = await request.text(); // Read body as raw text for HMAC validation

    if (!signature) {
      console.log('❌ Webhook Error: Missing signature (x-nowpayments-sig header).');
      return NextResponse.json({error: 'Missing signature'}, {status: 400});
    }

    // Verify the signature
    const hmac = crypto.createHmac('sha512', IPN_SECRET).update(body).digest('hex');

    if (hmac !== signature) {
      console.log('❌ Webhook Error: Invalid signature.');
      return NextResponse.json({error: 'Invalid signature'}, {status: 401});
    }

    // Safely parse the JSON now that the signature is verified
    const data = JSON.parse(body);
    console.log('🔔 NOWPayments Webhook Received:', JSON.stringify(data, null, 2));

    // Process the payment status
    if (data.payment_status === 'finished') {
      const orderId = data.order_id;
      const amount = data.price_amount;
      console.log(`✅ Payment completed for order: ${orderId}, Amount: ${amount}`);

      // Activate the user's subscription in Firestore
      await activateUserSubscription(orderId);
    } else {
        console.log(`ℹ️  Payment status is "${data.payment_status}" for order ${data.order_id}. No action taken.`);
    }

    return NextResponse.json({message: 'Webhook received'}, {status: 200});

  } catch (error: any) {
    console.error('🚨 Error processing webhook:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
