import { Anchor, Flex } from '@mantine/core';
// TODO: #auth Terms of use & Privacy Policy navigation
const TermsLinks = () => {
  return (
    <Flex gap={148} mt={5} justify="center" align="center">
      <Anchor href="/home" size="sm" c="blue.6" underline="hover">
        Terms of use
      </Anchor>
      <Anchor href="/home" size="sm" c="blue.6" underline="hover">
        Privacy policy
      </Anchor>
    </Flex>
  );
};

export default TermsLinks;
