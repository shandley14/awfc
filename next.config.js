/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export",
	images: {
	  unoptimized: true, // ✅ Disables Next.js image optimization for static export
	},
	eslint: {
		ignoreDuringBuilds: true,
	  },
  };
  
  module.exports = nextConfig;