
'use client';

import { createPlatePlugin } from '@udecode/plate/react';

import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';

export const FixedToolbarPlugin = createPlatePlugin({
  key: 'fixed-toolbar',
  render: {
    beforeEditable: () => (
      <div className="sticky top-0 left-0 right-0 z-40 w-full bg-white border-b border-gray-200">
      <FixedToolbar>
        <FixedToolbarButtons />
      </FixedToolbar>
    </div>
  ),
},
});
