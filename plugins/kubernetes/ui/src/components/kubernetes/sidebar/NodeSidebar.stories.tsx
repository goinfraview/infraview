import type { Meta, StoryObj } from "@storybook/react";
import { NodeSidebar } from "./NodeSidebar";

import data from "./node.mock.json";
import ResourceDrawerContainer from "../../../stories/containers/SidebarContainer";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Kubernetes/Sidebars/NodeSidebar",
  component: NodeSidebar,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof NodeSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    data,
  },
};

Primary.decorators = [
  (Story) => (
    <ResourceDrawerContainer title="Node" open onClose={() => {}}>
      <Story />
    </ResourceDrawerContainer>
  ),
];
