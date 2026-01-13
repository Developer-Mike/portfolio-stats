#!/usr/bin/env python3
import os
import json
import csv
import shutil
from datetime import datetime

def process_google_play_reports():
    """Import Google Play CSV reports into stats JSON files."""
    
    google_play_reports_dir = "/home/mika/documents/coding/misc/portfolio-stats/google-play-reports"
    stats_projects_dir = "/home/mika/documents/coding/misc/portfolio-stats/stats/projects"
    stats_total_path = "/home/mika/documents/coding/misc/portfolio-stats/stats/total.json"
    
    if not os.path.exists(google_play_reports_dir):
        print(f"Error: Google Play reports directory not found: {google_play_reports_dir}")
        return
    
    updated_projects = {}
    
    # Process each CSV file in google-play-reports
    for filename in os.listdir(google_play_reports_dir):
        if not filename.endswith('.csv'):
            continue
            
        # Extract project name from filename (without .csv extension)
        project_name = filename[:-4]
        csv_path = os.path.join(google_play_reports_dir, filename)
        stats_file_path = os.path.join(stats_projects_dir, f"{project_name}.json")
        
        # Check if corresponding stats file exists
        if not os.path.exists(stats_file_path):
            print(f"Error: Stats file not found for project '{project_name}': {stats_file_path}")
            continue
        
        print(f"Processing CSV: {filename} -> project: {project_name}")
        
        # Load existing stats
        with open(stats_file_path, 'r') as f:
            stats_data = json.load(f)
        
        # Ensure required structure exists
        if 'daily' not in stats_data:
            stats_data['daily'] = {}
        if 'per-service-total' not in stats_data:
            stats_data['per-service-total'] = {}
        
        max_total_installs = stats_data.get('per-service-total', {}).get('play-store-app', 0)
        
        # Create .processed folder if it doesn't exist
        processed_dir = os.path.join(google_play_reports_dir, '.processed')
        os.makedirs(processed_dir, exist_ok=True)
            
        try:
            # Read CSV with proper encoding handling
            with open(csv_path, 'r', encoding='utf-8-sig') as f:
                # Read raw content to handle the encoding issues
                content = f.read()
                
            # Clean up the content - remove extra spaces and null bytes
            content = content.replace('\x00', '').replace('  ', ' ')
            lines = content.strip().split('\n')
            
            if len(lines) < 2:
                print(f"  Warning: CSV file {filename} appears to be empty or malformed")
                continue
            
            # Parse header using CSV reader to handle quoted fields properly
            import csv
            from io import StringIO
            
            csv_reader = csv.reader(StringIO(lines[0]))
            header = next(csv_reader)
            header = [col.strip() for col in header]
            
            # Find the indices for Date and User acquisition (cumulative installs)
            date_idx = None
            total_installs_idx = None
            
            for i, col in enumerate(header):
                if 'date' in col.lower():
                    date_idx = i
                elif 'user acquisition' in col.lower() and 'cumulative' in col.lower():
                    total_installs_idx = i
            
            if date_idx is None or total_installs_idx is None:
                print(f"  Error: Could not find required columns in {filename}")
                print(f"  Available columns: {header}")
                continue
            
            # Process data rows using CSV reader
            for line_num, line in enumerate(lines[1:], 2):
                if not line.strip():
                    continue
                
                try:
                    # Parse CSV line properly
                    csv_reader = csv.reader(StringIO(line))
                    fields = next(csv_reader)
                    
                    if len(fields) <= max(date_idx, total_installs_idx):
                        print(f"  Warning: Skipping malformed line {line_num} in {filename}")
                        continue
                    
                    date_str = fields[date_idx].strip()
                    total_installs_str = fields[total_installs_idx].strip()
                    
                    # Parse date (format: "Jan 14, 2021" to YYYY-MM-DD)
                    date_obj = datetime.strptime(date_str, '%b %d, %Y')
                    date_key = date_obj.strftime('%Y-%m-%d')
                    
                    # Parse total installs (remove commas and convert to int)
                    total_installs_str = total_installs_str.replace(',', '')
                    total_installs = int(total_installs_str) if total_installs_str.isdigit() else 0
                    
                    # Update daily stats
                    if date_key not in stats_data['daily']:
                        stats_data['daily'][date_key] = {}
                    
                    stats_data['daily'][date_key]['play-store-app'] = total_installs
                    
                    # Track maximum total installs
                    max_total_installs = max(max_total_installs, total_installs)
                    
                except (ValueError, IndexError) as e:
                    print(f"  Warning: Error parsing line {line_num} in {filename}: {e}")
                    continue
                except Exception as e:
                    print(f"  Warning: CSV parsing error on line {line_num} in {filename}: {e}")
                    continue
            
            # Move processed CSV to .processed folder
            processed_csv_path = os.path.join(processed_dir, filename)
            shutil.move(csv_path, processed_csv_path)
            print(f"  Moved {filename} to .processed folder")
            
        except Exception as e:
            print(f"  Error processing {filename}: {e}")
            continue
        
        # Update per-service-total and total values
        stats_data['per-service-total']['play-store-app'] = max_total_installs
        stats_data['total'] = max_total_installs
        
        # Save updated stats file
        with open(stats_file_path, 'w') as f:
            json.dump(stats_data, f, indent=2)
        
        # Track updated projects for total.json update
        updated_projects[project_name] = {
            'per-service-total': stats_data['per-service-total'].copy(),
            'total': stats_data['total']
        }
        
        print(f"  Updated stats file with max total installs: {max_total_installs}")
        print()
    
    # Update stats/total.json with all project totals
    if updated_projects:
        update_total_stats(stats_total_path, updated_projects)


def update_total_stats(stats_total_path, updated_projects):
    """Update the stats/total.json file with updated project totals."""
    
    print("Updating stats/total.json...")
    
    # Load existing total stats or create new structure
    if os.path.exists(stats_total_path):
        with open(stats_total_path, 'r') as f:
            total_stats = json.load(f)
    else:
        total_stats = {}
    
    # Update the total stats with the new project data
    for project_name, project_data in updated_projects.items():
        total_stats[project_name] = project_data
    
    # Save updated total stats
    with open(stats_total_path, 'w') as f:
        json.dump(total_stats, f, indent=2)
    
    print(f"Updated stats/total.json with {len(updated_projects)} project(s)")
    print()

if __name__ == "__main__":
    process_google_play_reports()
    print("Import completed!")