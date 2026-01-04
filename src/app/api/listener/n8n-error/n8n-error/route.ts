// import { HttpError } from '@kontigo/commons';
// import { type } from 'arktype';
// import { ReasonPhrases, StatusCodes } from 'http-status-codes';
// import { fromAsyncThrowable } from 'neverthrow';
// import { NextResponse } from 'next/server';
// import { JsonPrimitive } from 'type-fest';

// import { findPaymentIntentByToken } from '@/entities/payment-intent/api';
// import { PaymentIntentNotFound, WebhookPaymentIntentResponse } from '@/entities/payment-intent/model';
// import { registerPrometeoEventToPaymentIntent } from '@/features/register-payment-provider-events/api';
// import { PrometeoNotification } from '@/shared/api/prometeo/model';
// import { atom } from '@/shared/factory';
// import { getErrorMessage } from '@/shared/lib';

// export async function POST(request: Request) {
//   const result = await atom(
//     fromAsyncThrowable(
//       async () => {
//         const body = await request.json();
//         const notification = PrometeoNotification(body);

//         if (notification instanceof type.errors) {
//           throw notification;
//         }

//         const [
//           {
//             payload: { external_id: token },
//           },
//         ] = notification.events;

//         const findPaymentIntentByTokenResult = await findPaymentIntentByToken(token);

//         if (findPaymentIntentByTokenResult.isErr()) {
//           throw findPaymentIntentByTokenResult.error;
//         }

//         const paymentIntent = findPaymentIntentByTokenResult.value;

//         if (!paymentIntent) {
//           throw new PaymentIntentNotFound();
//         }

//         const registerPrometeoEventToPaymentIntentResult = await registerPrometeoEventToPaymentIntent(notification);

//         if (registerPrometeoEventToPaymentIntentResult.isErr()) {
//           throw registerPrometeoEventToPaymentIntentResult.error;
//         }

//         const updated = registerPrometeoEventToPaymentIntentResult.value;

//         return {
//           token: updated.token,
//           currency: updated.currency,
//           amount: updated.amount.toNumber(),
//           concept: updated.concept,
//           external_id: updated.externalId,
//           state: updated.state,
//           origin_account: updated.originAccount,
//           origin_bank_code: updated.originBankCode,
//           destination_account: updated.destinationAccount,
//           destination_bank_code: updated.destinationBankCode,
//           operation_id: updated.operationId,
//           metadata: updated.metadata as Record<string, JsonPrimitive>,
//           payment_notification_url: updated.paymentNotificationUrl,
//           verify_token: updated.account.verifyToken,
//         } satisfies WebhookPaymentIntentResponse;
//       },
//       (error) => {
//         if (error instanceof type.errors) {
//           return new HttpError(ReasonPhrases.BAD_REQUEST, getErrorMessage(error), StatusCodes.BAD_REQUEST);
//         }

//         if (error instanceof PaymentIntentNotFound) {
//           return new HttpError(ReasonPhrases.NOT_FOUND, error.message, StatusCodes.NOT_FOUND);
//         }

//         console.error(error);

//         return new HttpError(
//           ReasonPhrases.INTERNAL_SERVER_ERROR,
//           getErrorMessage(error),
//           StatusCodes.INTERNAL_SERVER_ERROR,
//         );
//       },
//     ),
//   );

//   if (result.isErr()) {
//     const { message, error, statusCode, headers } = result.error;

//     return NextResponse.json({ message, error, statusCode }, { status: statusCode, headers });
//   }

//   return NextResponse.json(result.value, { status: StatusCodes.OK });
// }
