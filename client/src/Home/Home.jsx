import React from "react";
import { IoMdCloudUpload } from "react-icons/io";
import { SiFsecure, SiReact, SiRedux, SiTailwindcss, SiNodedotjs } from "react-icons/si";
import { GoFileSubmodule } from "react-icons/go";
import { TbUpload } from "react-icons/tb";
import { FaLink, FaShareSquare } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="font-sans bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-8 px-4 shadow-md">
        <h1 className="text-4xl font-bold">SafeDrop</h1>
        <p className="mt-2 text-lg text-blue-100">Fast, secure & simple file sharing solution</p>
      </header>

      {/* Hero Section */}
      <section className="bg-white text-center py-16 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">File Sharing, Made Effortless</h2>
          <p className="text-lg mb-8 text-gray-600">
            Upload, protect, and share your files instantly. No hassle.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition px-8 py-3 text-white rounded-lg font-medium shadow-md hover:shadow-lg w-full sm:w-auto">
                Get Started
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-white border border-gray-300 hover:bg-gray-50 transition px-8 py-3 text-gray-700 rounded-lg font-medium shadow-sm hover:shadow-md w-full sm:w-auto">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose SafeDrop?</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <IoMdCloudUpload size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Seamless Uploads</h3>
            <p className="text-gray-600">Upload files up to 10MB easily and securely with our intuitive interface.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <SiFsecure size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
            <p className="text-gray-600">Password-protected links with customizable expiry dates for enhanced security.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <GoFileSubmodule size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Access Anywhere</h3>
            <p className="text-gray-600">Files available 24/7 across all devices with responsive design.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-white py-16 px-4 shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How it Works</h2>
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl shadow-md text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">1</div>
                <TbUpload size={40} className="mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-3">Upload</h3>
                <p className="text-gray-600">Drag and drop your files or browse to select them.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl shadow-md text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">2</div>
                <FaLink size={40} className="mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-semibold mb-3">Secure</h3>
                <p className="text-gray-600">Add password protection and set expiry date if needed.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl shadow-md text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">3</div>
                <FaShareSquare size={40} className="mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-3">Share</h3>
                <p className="text-gray-600">Copy the link, generate QR code, or email directly to recipients.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools & Technologies */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Built With Modern Tools</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <SiReact size={40} className="text-blue-500 mb-3 mx-auto" />
            <p className="font-medium">React</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <SiRedux size={40} className="text-purple-600 mb-3 mx-auto" />
            <p className="font-medium">Redux Toolkit</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <SiTailwindcss size={40} className="text-blue-400 mb-3 mx-auto" />
            <p className="font-medium">Tailwind CSS</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <SiNodedotjs size={40} className="text-green-600 mb-3 mx-auto" />
            <p className="font-medium">Node.js</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">SafeDrop</h2>
              <p className="text-gray-400">Secure file sharing made simple</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold mb-3 text-blue-300">Links</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-300 hover:text-white">Features</a></li>
                  <li><a href="#how-it-works" className="text-gray-300 hover:text-white">How It Works</a></li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="border-gray-700 my-8" />
          <div className="flex justify-center">
            <p>&copy; {new Date().getFullYear()} SafeDrop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
