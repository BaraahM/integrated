import {
  CSSVariablesResolver,
  Table,
  Checkbox,
  Drawer,
  createTheme,
  mergeThemeOverrides,
} from '@mantine/core';
import checkboxClasses from './Checkbox.module.css';
import drawerClasses from './Drawer.module.css';
import tableClasses from './DataTable.module.css';

const baseTheme = createTheme({
  /* Put your mantine theme override here */
  primaryColor: 'gray',
  primaryShade: 8,
  defaultRadius: 'lg',
  components: {
    // checkboxes should be independent from  the defaultRadius setting
    Checkbox: Checkbox.extend({
      classNames: {
        input: checkboxClasses.input,
      },
    }),
    Drawer: Drawer.extend({
      classNames: {
        title: drawerClasses.title,
      },
    }),
    Table: Table.extend({
      classNames: {
        thead: tableClasses.header,
        td: tableClasses.td,
      },
    }),
    Notification: {
      styles: () => ({
        root: {
          backgroundColor: 'var(--notification-bg)',
          color: 'var(--notification-text)',
          borderColor: 'var(--notification-border)',
        },
        title: {
          color: 'var(--notification-text)',
        },
        description: {
          color: 'var(--notification-desc)',
        },
        closeButton: {
          color: 'var(--notification-text)',
          '&:hover': {
            backgroundColor: 'var(--notification-close-hover)',
          },
        },
      }),
    },
    // Button: Button.extend({
    //   defaultProps: {
    //     color: 'cyan',
    //     variant: 'outline',
    //   },
    // }),
  },
});

const customVariables = createTheme({
  other: {
    bgNavigation: {
      light: 'var(--mantine-color-gray-0)',
      dark: 'var(--mantine-color-dark-7)',
    },
    notification: {
      light: {
        bg: 'var(--mantine-color-gray-0)',
        text: 'var(--mantine-color-black)',
        border: 'var(--mantine-color-gray-3)',
        desc: 'var(--mantine-color-gray-7)',
        closeHover: 'var(--mantine-color-gray-1)',
      },
      dark: {
        bg: 'var(--mantine-color-dark-8)',
        text: 'var(--mantine-color-white)',
        border: 'var(--mantine-color-dark-4)',
        desc: 'var(--mantine-color-gray-4)',
        closeHover: 'var(--mantine-color-dark-6)',
      },
    },
  },
});

// Merge themes
// https://mantine.dev/theming/theme-object/#store-theme-override-object-in-a-variable
export const theme = mergeThemeOverrides(baseTheme, customVariables);

// Make custom variables availavle
// https://mantine.dev/styles/css-variables/#css-variables-resolver
export const cssVarResolver: CSSVariablesResolver = (currentTheme) => ({
  variables: {
    '--mantine-bg-navigation': currentTheme.other.bgNavigation,
  },
  light: {
    '--mantine-bg-navigation': currentTheme.other.bgNavigation,
    '--notification-bg': currentTheme.other.notification.light.bg,
    '--notification-text': currentTheme.other.notification.light.text,
    '--notification-border': currentTheme.other.notification.light.border,
    '--notification-desc': currentTheme.other.notification.light.desc,
    '--notification-close-hover':
      currentTheme.other.notification.light.closeHover,
  },
  dark: {
    '--mantine-bg-navigation': currentTheme.other.bgNavigation,
    '--notification-bg': currentTheme.other.notification.dark.bg,
    '--notification-text': currentTheme.other.notification.dark.text,
    '--notification-border': currentTheme.other.notification.dark.border,
    '--notification-desc': currentTheme.other.notification.dark.desc,
    '--notification-close-hover':
      currentTheme.other.notification.dark.closeHover,
  },
});
