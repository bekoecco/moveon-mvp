import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './ui';
import { App } from './App';
import './base.css';
import './style.css';

createRoot(document.getElementById('root')!).render(<Router><App /></Router>);
