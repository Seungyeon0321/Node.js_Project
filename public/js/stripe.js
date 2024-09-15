/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, token) => {
  const stripe = Stripe(
    'pk_test_51Prb3d06DU0Z6WBvLn1Od26xOhKFmL1lhxCf3sdfhdj9ghQ3zUUeXrZN3WPbIO9Ww7l5nhykxh4b2e3Mwt2LVkAj00x6oRKYrD',
  );

  try {
    // 1) Get checkout session from API
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`,
      {
        withCredentials: true,
        headers: {
          'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 토큰을 헤더에 추가
        },
      },
    );

    console.log('session', session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.error(
      'Booking error:',
      err.response ? err.response.data : err.message,
    );
    showAlert('error', err.response ? err.response.data.message : err.message);
  }
};
