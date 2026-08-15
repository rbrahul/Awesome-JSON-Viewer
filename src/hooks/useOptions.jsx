import { useEffect, useState } from 'react';

export const useOptions = (defaultOptions) => {
  const [options, setOptions] = useState(defaultOptions);
  useEffect(() => {
    const handleOptionsChange = (event) => {
      console.log('Received options change event in useOptions:', event);
      const newOptions = event.detail || {};
      setOptions(newOptions);
    };

    window.addEventListener('rb_json_viewer_pro_appscript_options_received', handleOptionsChange);
    window.addEventListener('rb_json_viewer_pro_appscript_options_updated', handleOptionsChange);

    return () => {
      window.removeEventListener('rb_json_viewer_pro_appscript_options_received', handleOptionsChange);
      window.removeEventListener('rb_json_viewer_pro_appscript_options_updated', handleOptionsChange);
    };
  }, []);

  return options;
}
