-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 04 Jul 2025 pada 03.04
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_finance`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `accounts`
--

CREATE TABLE `accounts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT 'General',
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `accounts`
--

INSERT INTO `accounts` (`id`, `user_id`, `name`, `type`, `balance`, `created_at`, `updated_at`) VALUES
(1, 2, 'BRI', 'General', 1024426001.00, '2025-06-21 11:21:33', '2025-07-01 11:09:05'),
(2, 3, 'BRIi', 'General', 1001113000.00, '2025-06-24 03:42:04', '2025-06-24 03:57:12'),
(3, 2, 'BNI', 'General', 22233233.00, '2025-07-01 10:06:14', '2025-07-01 11:09:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `budgets`
--

INSERT INTO `budgets` (`id`, `user_id`, `category_id`, `month`, `year`, `amount`, `created_at`, `updated_at`) VALUES
(2, 2, 1, 6, 2025, 100000.00, '2025-06-22 11:06:49', '2025-06-22 11:06:49'),
(3, 2, 8, 7, 2025, 100000.00, '2025-07-01 10:54:31', '2025-07-01 10:54:31'),
(5, 2, 3, 7, 2025, 4.00, '2025-07-01 10:54:40', '2025-07-01 10:54:46'),
(7, 2, 1, 7, 2025, 100000.00, '2025-07-01 10:54:58', '2025-07-01 10:54:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `created_at`, `updated_at`) VALUES
(1, 2, 'Makanan', '2025-06-20 10:44:59', '2025-06-20 10:44:59'),
(3, 2, 'Belanja', '2025-06-21 11:28:48', '2025-06-21 11:28:48'),
(4, 3, 'Makanannnn', '2025-06-24 03:40:42', '2025-06-24 03:57:04'),
(5, 3, 'Belanja', '2025-06-24 03:45:51', '2025-06-24 03:45:51'),
(6, 3, 'Transport', '2025-06-24 03:46:04', '2025-06-24 03:46:04'),
(7, 3, 'Gaji', '2025-06-24 03:48:32', '2025-06-24 03:48:32'),
(8, 2, 'tranportasi', '2025-07-01 10:54:31', '2025-07-01 10:54:31');

-- --------------------------------------------------------

--
-- Struktur dari tabel `debts`
--

CREATE TABLE `debts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `person_name` varchar(100) NOT NULL,
  `type` enum('hutang','piutang') NOT NULL,
  `notes` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('lunas','belum lunas') NOT NULL DEFAULT 'belum lunas',
  `amount_paid` decimal(15,2) DEFAULT 0.00,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `debts`
--

INSERT INTO `debts` (`id`, `user_id`, `person_name`, `type`, `notes`, `amount`, `status`, `amount_paid`, `due_date`, `created_at`, `updated_at`) VALUES
(4, 3, 'Haidar Cilacap', 'hutang', '', 100.00, 'belum lunas', 0.00, '2025-06-24', '2025-06-24 03:50:37', '2025-06-24 03:50:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `type` enum('income','expense') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `account_id`, `category_id`, `type`, `amount`, `description`, `transaction_date`, `created_at`, `updated_at`) VALUES
(5, 2, 1, 1, 'expense', 24000.00, 'Nasi Goreng ayam geprek', '2025-06-22', '2025-06-22 10:39:38', '2025-06-22 10:39:38'),
(6, 2, 1, 3, 'expense', 50000.00, 'Indomaret', '2025-06-22', '2025-06-22 10:45:59', '2025-06-22 10:45:59'),
(7, 3, 2, 4, 'expense', 50000.00, 'Nasgor', '2025-06-24', '2025-06-24 03:42:19', '2025-06-24 03:42:19'),
(8, 3, 2, 5, 'expense', 25000.00, 'Indomaret', '2025-06-24', '2025-06-24 03:46:24', '2025-06-24 03:46:24'),
(9, 3, 2, 6, 'expense', 12000.00, 'Gojek', '2025-06-24', '2025-06-24 03:46:44', '2025-06-24 03:46:44'),
(10, 3, 2, 7, 'income', 1200000.00, 'Gaji Tahunan', '2025-06-24', '2025-06-24 03:48:55', '2025-06-24 03:48:55'),
(11, 3, 2, 4, 'expense', 100.00, 'Nasgor', '2025-07-24', '2025-06-24 03:55:08', '2025-06-24 03:55:08'),
(12, 3, 2, 7, 'income', 100.00, 'Gaji Tahunan', '2025-07-21', '2025-06-24 03:55:36', '2025-06-24 03:55:36'),
(13, 2, 1, NULL, 'income', 10000000.00, 'Gaji Tahunan 1', '2025-07-01', '2025-07-01 09:35:07', '2025-07-01 09:35:07'),
(14, 2, 1, NULL, 'income', 2500000.00, 'Gaji bulan 1', '2025-07-01', '2025-07-01 10:04:46', '2025-07-01 10:04:46'),
(16, 2, 3, 1, 'expense', 100000.00, 'Nasgorr', '2025-07-01', '2025-07-01 10:07:04', '2025-07-01 10:57:14'),
(17, 2, 3, 1, 'expense', 100.00, 'Nasgor', '2025-06-30', '2025-07-01 10:20:27', '2025-07-01 10:55:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 'irhabmaster@gmail.com', '$2a$10$fH.9.jM67nL8aOeLz7b4U.xX2E8.L3e.j3Q3X5.s5K2.r5E5j5Z3C', '2025-06-02 07:53:51', '2025-06-19 11:59:39'),
(2, 'tes@gmail.com', '$2b$10$XKmvZ15w0/Ij3QnhAg5vOu3MxZxbN0kaHaFAAKQO5G6zdsJZSZ1J2', '2025-06-19 12:21:50', '2025-06-19 12:21:50'),
(3, 'haidar@mail.com', '$2b$10$dPokndFr2MJcl9ncprZ3lOjVib/7mF2BvDwK1xFxv3ecSIquioS4G', '2025-06-24 03:39:40', '2025-06-24 03:39:40'),
(4, 'irhab@gmail.com', '$2b$10$zgJNW6/ai0rCm7t1qnaeI.4WDYyq/t1TCIFKOgAR6J0SmIsIf8q16', '2025-06-29 07:39:10', '2025-06-29 07:39:10');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_budget` (`user_id`,`category_id`,`month`,`year`),
  ADD KEY `category_id` (`category_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `debts`
--
ALTER TABLE `debts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `debts`
--
ALTER TABLE `debts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Ketidakleluasaan untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `debts`
--
ALTER TABLE `debts`
  ADD CONSTRAINT `debts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_fk_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
