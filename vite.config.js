import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				entryFileNames: 'bundle.js', // 设置入口文件的名称
				chunkFileNames: 'chunks/[name].js', // 设置非入口 chunk 文件的名称
				assetFileNames: 'assets/[name].[ext]' // 设置其他资产文件的名称
			}
		}
	}
});
