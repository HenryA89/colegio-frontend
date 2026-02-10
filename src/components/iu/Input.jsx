// src/components/ui/Input.jsx
import React from "react";

const Input = ({ label, type = "text", value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default Input;
