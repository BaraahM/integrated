'use client';

import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';

export default function AccountSettings() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      console.log('Deleting account...');
      // TODO: Implement account deletion
      alert('Account deletion functionality coming soon!');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = () => {
    modals.openConfirmModal({
      title: 'Delete Account',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this account? All data, team members
          and projects will be permanently removed.
        </Text>
      ),
      labels: { confirm: 'Delete Account', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: handleDeleteAccount,
    });
  };

  return (
    <div>
      <Button
        size="md"
        color="red"
        loading={isDeleting}
        onClick={openDeleteModal}
      >
        Delete account
      </Button>
    </div>
  );
}
