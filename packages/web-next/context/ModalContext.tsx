'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ModalContextType {
  openModal: (modalKey: string) => void;
  closeModal: (modalKey: string) => void;
  isModalOpen: (modalKey: string) => boolean;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const openModal = (modalKey: string) => {
    setOpenModals((prev) => ({ ...prev, [modalKey]: true }));
  };

  const closeModal = (modalKey: string) => {
    setOpenModals((prev) => ({ ...prev, [modalKey]: false }));
  };

  const isModalOpen = (modalKey: string) => {
    return !!openModals[modalKey];
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalsContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
