import pandas as pd
from datetime import datetime, timedelta

# Read the CSV file
df = pd.read_csv('water_usage_data.csv')

# Set start date to November 1, 2025
start_date = datetime(2025, 11, 1)

# Update timestamps while keeping the same water usage values
df['timestamp'] = [start_date + timedelta(hours=i) for i in range(len(df))]

# Save the updated CSV
df.to_csv('water_usage_data.csv', index=False)

print(f'Updated {len(df)} rows')
print(f'Date range: {df["timestamp"].iloc[0]} to {df["timestamp"].iloc[-1]}')
