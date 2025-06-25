'use client';

import { Tabs, Space } from '@mantine/core';
import { useState } from 'react';
import SectionHeader from '../../components/page/SectionHeader';
import ProfileForm from './ProfileForm';
import PasswordChangeForm from './PasswordChangeForm';
import AccountSettings from './AccountSettings';
import TeamManagement from './TeamManagement';
import SubscriptionSettings from './SubscriptionSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <SectionHeader
              title="Profile"
              description="Update your profile information"
            />
            <Space h="xl" />
            <ProfileForm />
          </>
        );
      case 'password':
        return (
          <>
            <SectionHeader
              title="Password"
              description="Update your password here."
            />
            <Space h="xl" />
            <PasswordChangeForm />
          </>
        );
      case 'subscription':
        return (
          <>
            <SectionHeader
              title="Subscription"
              description="Manage your subscription and billing"
            />
            <Space h="xl" />
            <SubscriptionSettings />
          </>
        );
      case 'team':
        return (
          <>
            <SectionHeader
              title="Team"
              description="Manage your team members and invite new users"
            />
            <Space h="xl" />
            <TeamManagement />
          </>
        );
      case 'account':
        return (
          <>
            <SectionHeader
              title="Account"
              description="Delete your account here"
            />
            <Space h="xl" />
            <AccountSettings />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <SectionHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />
      <Space h="xl" />

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || 'profile')}
      >
        <Tabs.List>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="password">Password</Tabs.Tab>
          <Tabs.Tab value="subscription">Subscription</Tabs.Tab>
          <Tabs.Tab value="team">Team</Tabs.Tab>
          <Tabs.Tab value="account">Account</Tabs.Tab>
        </Tabs.List>

        <Space h="xl" />
        {renderTabContent()}
      </Tabs>
    </div>
  );
}
