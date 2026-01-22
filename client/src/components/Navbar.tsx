
import { Link } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Globe className="text-primary w-6 h-6" />
                    </div>
                    <span className="self-center text-2xl font-bold whitespace-nowrap text-white">PayFlow <span className="text-primary">Global</span></span>
                </Link>
                <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    <Link to="/login" className="glass-button flex items-center gap-2">
                        Get Started <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button data-collapse-toggle="navbar-sticky" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-sticky" aria-expanded="false">
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                </div>
                <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 dark:border-gray-700">
                        <li>
                            <Link to="/" className="block py-2 px-3 text-white bg-primary rounded md:bg-transparent md:text-primary md:p-0" aria-current="page">Home</Link>
                        </li>
                        <li>
                            <a href="#features" className="block py-2 px-3 text-gray-300 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:hover:bg-gray-700 dark:text-white md:dark:hover:text-primary dark:border-gray-700">Features</a>
                        </li>
                        <li>
                            <a href="#pricing" className="block py-2 px-3 text-gray-300 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-primary md:p-0 dark:hover:bg-gray-700 dark:text-white md:dark:hover:text-primary dark:border-gray-700">Pricing</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
