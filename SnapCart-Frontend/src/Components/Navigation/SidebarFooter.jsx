import { Twitter, Instagram, Facebook, Github } from "lucide-react";

const SidebarFooter = () => {
  return (
    <div className="mt-6 py-6 border-t border-gray-300 dark:border-slate-600">
      {/* Social Links */}
      <div className="flex gap-4 mb-4">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-300  hover:text-blue-500 transition-colors duration-300">
          <Twitter size={20} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-300 hover:text-pink-500 transition-colors duration-300">
          <Instagram size={20} />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-800  dark:text-gray-300  hover:text-blue-700 transition-colors duration-300">
          <Facebook size={20} />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-300  hover:text-black transition-colors duration-300">
          <Github size={20} />
        </a>
      </div>

      {/* Footer Text */}
      <div className="text-xs text-gray-600 dark:text-gray-400 tracking-wider">
        <span>© {new Date().getFullYear()} <span className="font-extrabold  text-black dark:text-white">SnapCart</span></span> All rights reserved
      </div>
    </div>
  );
};

export default SidebarFooter;
