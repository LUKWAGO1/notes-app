import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders notes management interface', () => {
  render(<App />);
  const addButtonElement = screen.getByText(/add note/i);
  expect(addButtonElement).toBeInTheDocument();
});
