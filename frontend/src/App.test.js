import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock halaman-halaman agar test fokus ke App.js (routing)
jest.mock('./HalamanLogin', () => () => <div>Halaman Login</div>);
jest.mock('./HalamanRegister', () => () => <div>Halaman Register</div>);
jest.mock('./HalamanUtama', () => () => <div>Dashboard</div>);
jest.mock('./HalamanLupasandi', () => () => <div>Halaman Lupa Sandi</div>);

describe('App Routing', () => {
  test('renders App component with routes', () => {
    render(<App />);

    // Cek apakah salah satu halaman ter-render (default route: "/")
    expect(screen.getByText(/Halaman Login/i)).toBeInTheDocument();
  });
});