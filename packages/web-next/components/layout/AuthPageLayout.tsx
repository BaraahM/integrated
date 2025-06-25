'use client';

import { Box, Container, Group, Space } from '@mantine/core';
import styles from './AuthPageLayout.module.css';

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <Group gap={0} justify="center" className={styles.wrapper}>
      <Box className={styles.contentWrapper}>
        <Container className={styles.content}>
          <Space h="xl" />
          <Space h="xl" />
          {children}
        </Container>
      </Box>
      <Group
        visibleFrom="sm"
        align="center"
        justify="center"
        className={styles.imageWrapper}
      >
        <div className={styles.backgroundPattern} />
      </Group>
    </Group>
  );
}
