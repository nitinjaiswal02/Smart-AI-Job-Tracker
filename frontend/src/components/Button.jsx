// A single reusable button with two visual styles (variants). Instead of
// copy-pasting the same long string of Tailwind classes everywhere we need
// a button, we centralize it here. Change the design once, it updates
// EVERYWHERE the component is used — that's the whole point of components.
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-700',
    secondary: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;