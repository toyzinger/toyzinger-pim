import { FormInput } from './form-input/form-input';
import { FormTextarea } from './form-textarea/form-textarea';
import { FormSelect } from './form-select/form-select';
import { FormCheckbox } from './form-checkbox/form-checkbox';
import { FormDualtextarea } from './form-dualtextarea/form-dualtextarea';
import { FormAccessories } from './form-accessories/form-accessories';

export const FormComponents = [
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormDualtextarea,
  FormAccessories,
] as const;

export { FormInput, FormTextarea, FormSelect, FormCheckbox, FormDualtextarea, FormAccessories };
