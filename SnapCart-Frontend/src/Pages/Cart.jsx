/* eslint-disable no-unused-vars */
import { useContext, useState } from "react";
import useCartContext from "../context/Cart/useCartContext";

const Cart = () => {

  const { cart, removeFromCart } = useCartContext();

  return (
    <div className="px-10 py-40 block w-full lg:w-[55vw] mx-auto">
      <h2 className="font-bold text-4xl text-center text-blue-400 underline underline-offset-8">Your Cart</h2>
      {cart.length === 0 ? (
        <h1 className="my-16 text-center text-3xl font-semibold">Your cart is empty.</h1>
      ) : (
        cart.map((item, index) => (
          <div key={index} className="border-b py-10 flex max-sm:flex-col items-center gap-10">
            <img src={item.image} alt={item.title} className="w-24 h-24 object-contain" />
            <div className="w-full">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="text-sm text-gray-500">{item.description.substring(0, 100)}...</p>
              <div className="flex items-center justify-between text-sm font-semibold py-4">
                <p className="">Quantity: {item.qty}</p>
                <button onClick={() => removeFromCart(item.title)} className="text-blue-500 border border-blue-400 px-4 py-1 hover:bg-blue-400  hover:text-white rounded-md">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Cart;
