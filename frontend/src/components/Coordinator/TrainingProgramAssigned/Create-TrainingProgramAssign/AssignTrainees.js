import React, { useEffect, useState } from "react";
import { Select, Typography, Tag, message } from "antd";
import { getBatches } from "../../../../configs/coordinator_api_config";

const { Title } = Typography;
const { Option } = Select;

const AssignTrainees = ({ formData, setFormData }) => {
  const [selectedBatchIds, setSelectedBatchIds] = useState(
    formData.batches?.map((b) => b.batch_id) || []
  );
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await getBatches();
        const batchesData = response.data || [];

        // Ensure correct key naming and transform data for consistency
        const formattedBatches = batchesData.map((batch) => ({
          id: batch.id,  // Use id from API response
          name: batch.name,
        }));

        setBatches(formattedBatches);

        // Filter selected batch IDs to keep only valid ones
        const validSelectedBatchIds = formData.batches
          ?.map((batch) => batch.batch_id)
          .filter((id) => formattedBatches.some((b) => b.id === id)) || [];

        setSelectedBatchIds(validSelectedBatchIds);
      } catch (error) {
        console.error("Error fetching batches:", error);
        message.error("Failed to fetch batches");
      }
    };

    fetchBatches();
  }, [formData.batches]);

  const handleBatchSelect = (selectedIds) => {
    setSelectedBatchIds(selectedIds);

    // Map selected batch IDs to corresponding batch objects
    const updatedBatches = selectedIds.map((id) => {
      const batch = batches.find((b) => b.id === id);
      return { batch_id: id, name: batch?.name || "Unknown" };
    });

    // Update formData with the correct structure
    setFormData((prev) => ({ ...prev, batches: updatedBatches }));
  };

  return (
    <div>
      <Title level={3}>Assign Trainees</Title>
      <Select
        mode="multiple"
        placeholder="Select batches"
        style={{ width: "100%" }}
        value={selectedBatchIds}
        onChange={handleBatchSelect}
        optionLabelProp="label"
      >
        {batches.map((batch) => (
          <Option key={batch.id} value={batch.id} label={batch.name}>
            <Tag color="blue">{batch.name}</Tag>
          </Option>
        ))}
      </Select>

      <div style={{ marginTop: "16px" }}>
        <Title level={4}>Selected Batches:</Title>
        {selectedBatchIds.length > 0 ? (
          selectedBatchIds.map((id) => {
            const batch = batches.find((b) => b.id === id);
            return batch ? <Tag key={id}>{batch.name}</Tag> : null;
          })
        ) : (
          <p>No batches selected</p>
        )}
      </div>
    </div>
  );
};

export default AssignTrainees;