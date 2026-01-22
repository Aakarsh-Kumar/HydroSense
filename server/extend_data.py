import pandas as pd
from datetime import datetime, timedelta
import numpy as np

# Read the existing CSV
df = pd.read_csv('water_usage_data.csv')

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Get the last timestamp
last_timestamp = df['timestamp'].iloc[-1]
print(f'Last timestamp in file: {last_timestamp}')

# Target end date: January 22, 2026 23:00:00
target_date = datetime(2026, 1, 22, 23, 0, 0)
print(f'Target end date: {target_date}')

# Calculate how many hours to add
hours_to_add = int((target_date - last_timestamp).total_seconds() / 3600)
print(f'Hours to add: {hours_to_add}')

# Generate new rows
new_rows = []
for i in range(1, hours_to_add + 1):
    new_timestamp = last_timestamp + timedelta(hours=i)
    # Generate random water usage similar to existing pattern (mean ~10, std ~1.5)
    water_usage = np.random.normal(10, 1.5)
    new_rows.append({
        'timestamp': new_timestamp,
        'water_usage': water_usage
    })

# Create new dataframe and append
new_df = pd.DataFrame(new_rows)
df_extended = pd.concat([df, new_df], ignore_index=True)

# Save to CSV
df_extended.to_csv('water_usage_data.csv', index=False)

print(f'\nAdded {len(new_rows)} new rows')
print(f'New date range: {df_extended["timestamp"].iloc[0]} to {df_extended["timestamp"].iloc[-1]}')
print(f'Total rows: {len(df_extended)}')
