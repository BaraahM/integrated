'use client';

import {
  Button,
  Table,
  Text,
  Stack,
  Group,
  Avatar,
  Badge,
  ActionIcon,
  Paper,
} from '@mantine/core';
import { IconUserPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import Section from '../../components/page/Section';

// Mock data for demo
const mockTeamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    avatar: null,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Member',
    avatar: null,
  },
];

const mockInvitations = [
  {
    id: '1',
    email: 'invited@example.com',
    role: 'Member',
    sentAt: '2024-01-15',
  },
];

export default function TeamManagement() {
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteUser = () => {
    setIsInviting(true);
    // TODO: Implement invite functionality
    setTimeout(() => {
      setIsInviting(false);
      alert('User invite functionality coming soon!');
    }, 1000);
  };

  const handleDeleteMember = (memberId: string) => {
    console.log('Delete member:', memberId);
    alert('Delete member functionality coming soon!');
  };

  const handleRevokeInvitation = (inviteId: string) => {
    console.log('Revoke invitation:', inviteId);
    alert('Revoke invitation functionality coming soon!');
  };

  return (
    <Stack gap="xl">
      <Section
        heading="Team members"
        description="Your current team members are listed here."
      >
        <Paper withBorder p="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mockTeamMembers.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" name={member.name} />
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>
                          {member.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {member.email}
                        </Text>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {member.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Section>

      <Section
        heading="Pending invitations"
        description="Invited users are listed here."
      >
        <Paper withBorder p="md">
          {mockInvitations.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Sent</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockInvitations.map((invite) => (
                  <Table.Tr key={invite.id}>
                    <Table.Td>{invite.email}</Table.Td>
                    <Table.Td>
                      <Badge variant="outline" size="sm">
                        {invite.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {invite.sentAt}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleRevokeInvitation(invite.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed" ta="center" py="md">
              No pending invitations
            </Text>
          )}
        </Paper>
      </Section>

      <Group justify="flex-start">
        <Button
          leftSection={<IconUserPlus size={16} />}
          loading={isInviting}
          onClick={handleInviteUser}
        >
          Invite team member
        </Button>
      </Group>
    </Stack>
  );
}
