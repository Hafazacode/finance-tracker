import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock modal dan child component agar test tetap fokus pada App.js
jest.mock('./ModalBudget', () => () => <div data-testid="modal-budget" />);
jest.mock('./IconPickerModal', () => () => <div data-testid="icon-picker" />);
jest.mock('./RecentTransaction', () => () => <div data-testid="recent-tab" />);
jest.mock('./FilterTransaksi', () => () => <div data-testid="filter-transaksi" />);

describe('App Component', () => {
  test('renders app title', () => {
    render(<App />);
    const titleElement = screen.getByText(/KeuanganKu/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders Budgets section and categories', () => {
    render(<App />);
    expect(screen.getByText('Budgets')).toBeInTheDocument();
    expect(screen.getByText('Makanan')).toBeInTheDocument();
    expect(screen.getByText('Transportasi')).toBeInTheDocument();
  });

  test('renders button to add budget', () => {
    render(<App />);
    const addButton = screen.getByText(/\+ Tambah Budgets/i);
    expect(addButton).toBeInTheDocument();
  });

  test('renders Transaction tabs', () => {
    render(<App />);
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Harian')).toBeInTheDocument();
    expect(screen.getByText('Bulanan')).toBeInTheDocument();
    expect(screen.getByText('Tahunan')).toBeInTheDocument();
  });
});