// Externals
import { Action, Dispatch } from 'redux';
import axios from 'axios';

import BasketItem from '../../models/BasketItem';
import { IState } from '../rootReducer';

let newTotal = 0;

export function incrementItem(basketItem: BasketItem) {
  const controller = new AbortController();
  return (dispatch: Dispatch<Action>, getState: () => IState) => {
    const state: IState = getState();

    // Call this same function after 3 seconds to avoid concurrency
    // if (state.basket.calculatingBasketInApi) {
    //   return setTimeout(() => {
    //     return incrementItem(basketItem)(dispatch, getState);
    //   }, 3000);
    // }

    if (state.basket.calculatingBasketInApi) {
      controller.abort();
    }

    dispatch({
      type: 'calculating_basket',
      payload: true,
    });

    const basketItems = state.basket.items.map((item) => {
      if (item.id === basketItem.id) {
        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    });

    newTotal = basketItems.reduce((previousValue: number, currentValue) => {
      const basketItemTotal = currentValue.itemPrice * currentValue.quantity;

      return previousValue + basketItemTotal;
    }, 0);

    dispatch({
      type: 'update-basket',
      payload: basketItems,
    });

    // Simulate a real validate basket
    axios
      .get('https://2486713dae314753ae6b0ff127002d12.api.mockbin.io/', {
        signal: controller.signal,
      })
      .then(() => {
        dispatch({
          type: 'update-basket-totals',
          payload: newTotal,
        });

        dispatch({
          type: 'calculating_basket',
          payload: false,
        });
      })
      .catch((error) => {
        if (error.code === 'ERR_CANCELED') return;

        throw new Error(error);
      });
  };
}

export function decrementItem(basketItem: BasketItem) {
  const controller = new AbortController();
  return (dispatch: Dispatch<Action>, getState: () => IState) => {
    const state: IState = getState();

    // Call this same function after 3 seconds to avoid concurrency
    // if (state.basket.calculatingBasketInApi) {
    //   return setTimeout(() => {
    //     return incrementItem(basketItem)(dispatch, getState);
    //   }, 3000);
    // }

    if (state.basket.calculatingBasketInApi) {
      controller.abort();
    }

    const foundItem = state.basket.items.find((item) => {
      return item.id === basketItem.id;
    });

    // Disabling 0 quantity
    if (foundItem?.quantity === 1) {
      return;
    }

    dispatch({
      type: 'calculating_basket',
      payload: true,
    });

    const basketItems = state.basket.items.map((item) => {
      if (item.id === basketItem.id) {
        return {
          ...item,
          quantity: item.quantity - 1,
        };
      }

      return item;
    });

    newTotal = basketItems.reduce((previousValue: number, currentValue) => {
      const basketItemTotal = currentValue.itemPrice * currentValue.quantity;

      return previousValue + basketItemTotal;
    }, 0);

    dispatch({
      type: 'update-basket',
      payload: basketItems,
    });

    // Simulate a real validate basket
    axios
      .get('https://2486713dae314753ae6b0ff127002d12.api.mockbin.io/', {
        signal: controller.signal,
      })
      .then(function () {
        dispatch({
          type: 'update-basket-totals',
          payload: newTotal,
        });

        dispatch({
          type: 'calculating_basket',
          payload: false,
        });
      })
      .catch((error) => {
        if (error.code === 'ERR_CANCELED') return;

        throw new Error(error);
      });
  };
}
