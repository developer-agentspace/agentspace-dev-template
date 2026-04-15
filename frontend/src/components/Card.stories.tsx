import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';
import { Card } from './Card';

const meta = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    title: 'Example card',
    subtitle: 'A short description of what this card represents',
    children: 'Card body content goes here. Cards are intentionally generic — wrap any content you want.',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutHeader: Story = {
  args: {
    title: undefined,
    subtitle: undefined,
  },
};

export const WithButtons: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Cards compose with other primitives. Buttons and other components
          can sit inside the body and inherit the card's padding.
        </p>
        <div className="flex gap-2">
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </div>
    ),
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      {[1, 2, 3].map((i) => (
        <Card key={i} title={`Item ${i}`} subtitle="Sample subtitle">
          <p className="text-sm text-slate-600">
            Cards in a responsive grid. Reflows from 1 column on mobile to 3 on desktop.
          </p>
        </Card>
      ))}
    </div>
  ),
};
