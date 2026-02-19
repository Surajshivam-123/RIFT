import className from "classnames";
import { twMerge } from "tailwind-merge";

function Button({
  children,
  primary,
  secondary,
  success,
  warning,
  danger,
  outline,
  rounded,
  ...rest
}) {
  const classes = twMerge(
    className(
      rest.className,
      "flex items-center justify-center gap-2 px-6 py-3 border-2 font-bold text-sm tracking-wide",
      "transition-all duration-300 ease-in-out cursor-pointer select-none uppercase",
      "hover:shadow-2xl hover:-translate-y-1 active:scale-95 active:shadow-md",
      "focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0",
      {
        // Primary - Blue with gradient
        "border-blue-600 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50": primary && !outline,
        "hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:shadow-blue-600/60": primary && !outline,
        "focus-visible:ring-blue-500/50": primary,
        
        // Secondary - Gray/Dark with gradient
        "border-gray-800 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white shadow-lg shadow-gray-800/50": secondary && !outline,
        "hover:from-gray-800 hover:via-gray-900 hover:to-black hover:shadow-gray-900/60": secondary && !outline,
        "focus-visible:ring-gray-700/50": secondary,
        
        // Success - Green with gradient
        "border-green-600 bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white shadow-lg shadow-green-500/50": success && !outline,
        "hover:from-green-600 hover:via-green-700 hover:to-green-800 hover:shadow-green-600/60": success && !outline,
        "focus-visible:ring-green-500/50": success,
        
        // Warning - Orange with gradient
        "border-orange-600 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/50": warning && !outline,
        "hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 hover:shadow-orange-600/60": warning && !outline,
        "focus-visible:ring-orange-500/50": warning,
        
        // Danger - Red with gradient
        "border-red-600 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-lg shadow-red-500/50": danger && !outline,
        "hover:from-red-600 hover:via-red-700 hover:to-red-800 hover:shadow-red-600/60": danger && !outline,
        "focus-visible:ring-red-500/50": danger,

        // Outline variants with backdrop blur
        "bg-white/95 backdrop-blur-md shadow-lg": outline,
        "text-blue-700 border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:shadow-blue-500/30": outline && primary,
        "text-gray-900 border-gray-800 hover:bg-gray-50 hover:border-gray-900 hover:shadow-gray-800/30": outline && secondary,
        "text-green-700 border-green-600 hover:bg-green-50 hover:border-green-700 hover:shadow-green-500/30": outline && success,
        "text-orange-700 border-orange-600 hover:bg-orange-50 hover:border-orange-700 hover:shadow-orange-500/30": outline && warning,
        "text-red-700 border-red-600 hover:bg-red-50 hover:border-red-700 hover:shadow-red-500/30": outline && danger,

        // Border radius
        "rounded-full": rounded,
        "rounded-xl": !rounded,
      }
    )
  );

  return (
    <>
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
    </>
  );
}

export default Button;


Button.propTypes = {
  checkVariationValue: ({ primary, secondary, success, warning, danger }) => {
    const count =
      Number(!!primary) +
      Number(!!secondary) +
      Number(!!warning) +
      Number(!!success) +
      Number(!!danger);

    if (count > 1) {
      return new Error(
        "Only one of primary, secondary, success, warning, danger can be true"
      );
    }
  },
};
