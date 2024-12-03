import React from 'react';
import { Form, Select, Input } from 'antd';
import { Controller } from 'react-hook-form';

const { Option } = Select;

const AddressForm = ({ 
  control, 
  errors, 
  pincodes, 
  sachivalayamOptions, 
  handlePincodeChange 
}) => {
  return (
    <>
      <Form.Item
        label="Pincode"
        validateStatus={errors.pincode ? "error" : ""}
        help={errors.pincode?.message}
      >
        <Controller
          name="pincode"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Select Pincode"
              onChange={(value) => {
                field.onChange(value);
                handlePincodeChange(value);
              }}
            >
              {pincodes.map((pincode) => (
                <Option key={pincode} value={pincode}>
                  {pincode}
                </Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item
        label="State"
        validateStatus={errors.state ? "error" : ""}
        help={errors.state?.message}
      >
        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <Input {...field} disabled placeholder="State" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="District"
        validateStatus={errors.district ? "error" : ""}
        help={errors.district?.message}
      >
        <Controller
          name="district"
          control={control}
          render={({ field }) => (
            <Input {...field} disabled placeholder="District" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Mandal"
        validateStatus={errors.mandal ? "error" : ""}
        help={errors.mandal?.message}
      >
        <Controller
          name="mandal"
          control={control}
          render={({ field }) => (
            <Input {...field} disabled placeholder="Mandal" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Sachivalayam"
        validateStatus={errors.sachivalayam ? "error" : ""}
        help={errors.sachivalayam?.message}
      >
        <Controller
          name="sachivalayam"
          control={control}
          render={({ field }) => (
            <Select {...field} placeholder="Select Sachivalayam">
              {sachivalayamOptions.map((sachivalayam) => (
                <Option key={sachivalayam} value={sachivalayam}>
                  {sachivalayam}
                </Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item
        label="Address"
        validateStatus={errors.address ? "error" : ""}
        help={errors.address?.message}
      >
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input.TextArea {...field} placeholder="Enter Full Address" />
          )}
        />
      </Form.Item>
    </>
  );
};

export default AddressForm;
