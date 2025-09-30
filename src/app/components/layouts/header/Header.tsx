import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="divide-y border-gray-200 dark:border-gray-800 border-b">
      <div className="px-4 py-3 md:py-6 lg:px-6">
        <div className="flex items-center space-y-2 md:space-y-0 md:space-x-6">
          <Link href="/" className="text-2xl font-bold tracking-tighter mr-4">
            Room Reservation
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link
              //   className="font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              className="bg-black py-3 px-4 text-white rounded-md font-medium"
              href="/"
            >
              Calendar
            </Link>
            <Link
              //   className="font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              className="bg-black py-3 px-4 text-white rounded-md font-medium"
              href="/history"
            >
              ログ
            </Link>
            {/* <Link
              className="bg-black py-3 px-4 text-white rounded-md font-medium"
              href="/bbs-posts/create"
            >
              Create Post
            </Link> */}
            <Link
              className="bg-black py-3 px-4 text-white rounded-md font-medium"
              href="/rooms"
            >
              部屋管理
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
