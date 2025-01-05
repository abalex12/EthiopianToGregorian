from converter import EthiopianDateConverter

converter = EthiopianDateConverter()

# Gregorian to Ethiopian
ethiopian_date = converter.to_ethiopian(2025, 1, 5)
print(ethiopian_date)  # Expected: (2017, 4, 27)

# Ethiopian to Gregorian
gregorian_date = converter.to_gregorian(2017,4,27)
print(gregorian_date)  # Expected: 2025-01-05
