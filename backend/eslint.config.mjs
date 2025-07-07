import js from "@eslint/js";
import globals from "globals";

// Dengan format "flat config" yang baru, kita tidak lagi butuh 'defineConfig'.
// Kita langsung mengekspor array dari objek konfigurasi.
export default [
  {
    // Terapkan aturan ini ke semua file JavaScript/MJS/CJS
    files: ["**/*.{js,mjs,cjs}"],
    
    // Aturan mengenai bahasa JavaScript itu sendiri
    languageOptions: {
      ecmaVersion: "latest", // Gunakan versi JavaScript terbaru
      sourceType: "module",  // Izinkan penggunaan 'import'/'export'
      globals: {
        ...globals.node, // Izinkan variabel global Node.js (seperti 'require', 'process')
        // Kita hapus '...globals.browser' karena tidak diperlukan di backend
      }
    },
    
    // Aturan spesifik dari ESLint
    rules: {
      // Gunakan semua aturan yang direkomendasikan oleh ESLint
      ...js.configs.recommended.rules,
      
      // Ubah aturan 'no-unused-vars' dari error menjadi warning (peringatan)
      // Ini akan membuat semua warning "is assigned a value but never used" tidak lagi menghentikan build.
      "no-unused-vars": "warn", 
    },
  }
];
