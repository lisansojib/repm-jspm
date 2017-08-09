export function configure(config) {
  config.globalResources(
    'resources/value-converters/ralistings',
    'resources/value-converters/date-format', 
    'resources/value-converters/number-format', 
    'resources/value-converters/remove-Spaces', 
    'resources/value-converters/time-format', 
    'resources/value-converters/sort'
  );
}
