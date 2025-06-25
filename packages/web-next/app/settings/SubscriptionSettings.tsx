'use client';

import {
  Button,
  Card,
  Text,
  Stack,
  Group,
  Badge,
  SimpleGrid,
  List,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import Section from '../../components/page/Section';

// Mock subscription plans
const mockPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    description: 'Take a look around.',
    features: [
      'Few projects',
      'Few collaborators',
      'Few storage',
      'Basic support',
    ],
    isCurrent: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    currency: 'USD',
    interval: 'month',
    description: 'Try a little more.',
    features: [
      'More projects',
      'More collaborators',
      'More storage',
      'Priority support',
    ],
    isCurrent: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    description: 'The full experience.',
    features: [
      'Unlimited projects',
      'Unlimited collaborators',
      'Unlimited storage',
      'Premium support',
    ],
    isCurrent: false,
  },
];

export default function SubscriptionSettings() {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const handleUpgrade = (planId: string) => {
    setIsUpgrading(planId);
    // TODO: Implement subscription upgrade
    setTimeout(() => {
      setIsUpgrading(null);
      alert('Subscription upgrade functionality coming soon!');
    }, 1000);
  };

  const handleManageBilling = () => {
    alert('Billing management functionality coming soon!');
  };

  return (
    <Stack gap="xl">
      <Section
        heading="Current Subscription"
        description="Your current plan and billing information."
      >
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <div>
              <Text fw={500}>Free Plan</Text>
              <Text size="sm" c="dimmed">
                $0/month
              </Text>
            </div>
            <Badge color="green" variant="light">
              Current
            </Badge>
          </Group>
          <Text size="sm" mb="md">
            Your plan automatically renews on the 15th of each month.
          </Text>
          <Button variant="outline" onClick={handleManageBilling}>
            Manage Billing
          </Button>
        </Card>
      </Section>

      <Section
        heading="Available Plans"
        description="Upgrade your plan to unlock more features."
      >
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {mockPlans.map((plan) => (
            <Card key={plan.id} withBorder p="lg" radius="md">
              <Stack gap="md">
                <div>
                  {plan.isCurrent && (
                    <Badge color="green" variant="light" mb="xs">
                      Current Plan
                    </Badge>
                  )}
                  <Text fw={600} size="lg">
                    {plan.name}
                  </Text>
                  <Group gap="xs" align="baseline">
                    <Text size="xl" fw={700}>
                      ${plan.price}
                    </Text>
                    <Text size="sm" c="dimmed">
                      /{plan.interval}
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed" mt="xs">
                    {plan.description}
                  </Text>
                </div>

                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <IconCheck
                      size={16}
                      style={{ color: 'var(--mantine-color-green-6)' }}
                    />
                  }
                >
                  {plan.features.map((feature, index) => (
                    <List.Item key={index}>{feature}</List.Item>
                  ))}
                </List>

                {!plan.isCurrent && (
                  <Button
                    fullWidth
                    loading={isUpgrading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Section>
    </Stack>
  );
}
