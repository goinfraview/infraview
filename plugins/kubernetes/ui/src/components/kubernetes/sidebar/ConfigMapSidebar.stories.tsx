import type { Meta, StoryObj } from "@storybook/react";
import { ConfigMapSidebar } from "./ConfigMapSidebar";

import data from "./configmap.mock.json";
import ResourceDrawerContainer from "../../../stories/containers/SidebarContainer";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Kubernetes/Sidebars/ConfigMapSidebar",
  component: ConfigMapSidebar,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof ConfigMapSidebar>;

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
    <ResourceDrawerContainer title="ConfigMap" open onClose={() => {}}>
      <Story />
    </ResourceDrawerContainer>
  ),
];
