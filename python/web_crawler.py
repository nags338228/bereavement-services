import json
import requests
from bs4 import BeautifulSoup

# Load links from JSON file
def load_links(json_file):
    with open(json_file, 'r') as file:
        return json.load(file)

# Crawl and extract content
def crawl_content(links, class_name):
    results = []
    for link in links:
        try:
            response = requests.get(link)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            # Extract content with the specified class
            content = soup.find_all(class_=class_name)
            for item in content:
                # Remove unwanted footer tags
                unwanted_footer = item.find("footer", class_="postFooterWrapper")
                if unwanted_footer:
                    unwanted_footer.extract()
                # Clean up and preserve HTML
                trimmed_content = str(item).strip()
                results.append(trimmed_content)
        except requests.RequestException as e:
            print(f"Failed to fetch {link}: {e}")
    return results

# Save content to XML file (format based on uploaded file)
def save_to_xml(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write('<?xml version="1.0" encoding="utf-8"?>\n<rss>\n  <channel>\n')
        for i, content in enumerate(data, start=1):
            file.write(f'    <item>\n')
            file.write(f'      <title>Post {i}</title>\n')
            file.write(f'      <content:encoded><![CDATA[{content}]]></content:encoded>\n')
            file.write(f'    </item>\n')
        file.write('  </channel>\n</rss>')

# Main script
if __name__ == "__main__":
    # Configuration
    input_json = "links.json"  # JSON file containing the links
    output_dir = "output"  # Directory to save output files
    chunk_size = 100  # Number of links per crawl
    class_name = "content postContent faqContent"

    # Load all links
    all_links = load_links(input_json)
    total_links = len(all_links)

    for start in range(0, total_links, chunk_size):
        # Get a chunk of links
        chunk_links = all_links[start:start + chunk_size]
        # Crawl content
        crawled_content = crawl_content(chunk_links, class_name)
        # Save content to XML
        output_file = f"{output_dir}/crawled_content_{start//chunk_size + 1}.xml"
        save_to_xml(crawled_content, output_file)
        print(f"Saved: {output_file}")
