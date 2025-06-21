import asyncio
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import hashlib
import time
from typing import Dict, List, Set, Optional
from dataclasses import dataclass
from enum import Enum
import re
import json
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentType(Enum):
    PRODUCT = "product"
    ARTICLE = "article"
    FAQ = "faq"
    CONTACT = "contact"
    ABOUT = "about"
    TECHNICAL = "technical"
    GENERAL = "general"

@dataclass
class CrawledContent:
    url: str
    title: str
    content: str
    content_type: ContentType
    metadata: Dict
    timestamp: float

class ContentClassifier:
    """Classifies web content into different categories"""
    
    def __init__(self):
        self.patterns = {
            ContentType.PRODUCT: [
                r'product', r'shop', r'buy', r'price', r'cart', r'store',
                r'catalog', r'inventory', r'item', r'purchase'
            ],
            ContentType.FAQ: [
                r'faq', r'frequently asked', r'questions', r'help',
                r'support', r'how to', r'troubleshoot'
            ],
            ContentType.CONTACT: [
                r'contact', r'reach us', r'get in touch', r'phone',
                r'email', r'address', r'location'
            ],
            ContentType.ABOUT: [
                r'about', r'our story', r'company', r'team', r'history',
                r'mission', r'vision', r'who we are'
            ],
            ContentType.ARTICLE: [
                r'blog', r'article', r'news', r'post', r'read more',
                r'published', r'author'
            ],
            ContentType.TECHNICAL: [
                r'api', r'documentation', r'docs', r'technical',
                r'specification', r'guide', r'tutorial', r'manual'
            ]
        }
    
    def classify(self, url: str, title: str, content: str) -> ContentType:
        """Classify content based on URL, title, and content"""
        text_to_analyze = f"{url} {title} {content}".lower()
        
        scores = {}
        for content_type, patterns in self.patterns.items():
            score = sum(len(re.findall(pattern, text_to_analyze)) 
                       for pattern in patterns)
            scores[content_type] = score
        
        if max(scores.values()) == 0:
            return ContentType.GENERAL
        
        return max(scores, key=scores.get)

class VectorStoreManager:
    """Manages multiple vector databases for different content types"""
    
    def __init__(self, base_path: str = "./vector_stores"):
        self.base_path = base_path
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.stores = {}
        self._initialize_stores()
    
    def _initialize_stores(self):
        """Initialize ChromaDB collections for each content type"""
        for content_type in ContentType:
            client = chromadb.PersistentClient(
                path=f"{self.base_path}/{content_type.value}",
                settings=Settings(allow_reset=True)
            )
            collection = client.get_or_create_collection(
                name=f"{content_type.value}_collection",
                metadata={"description": f"Collection for {content_type.value} content"}
            )
            self.stores[content_type] = collection
    
    def store_content(self, content: CrawledContent):
        """Store content in the appropriate vector database"""
        try:
            # Generate embedding
            embedding = self.embedding_model.encode(content.content).tolist()
            
            # Create unique ID
            content_id = hashlib.md5(content.url.encode()).hexdigest()
            
            # Store in appropriate collection
            collection = self.stores[content.content_type]
            collection.add(
                ids=[content_id],
                embeddings=[embedding],
                documents=[content.content],
                metadatas=[{
                    "url": content.url,
                    "title": content.title,
                    "content_type": content.content_type.value,
                    "timestamp": content.timestamp,
                    **content.metadata
                }]
            )
            logger.info(f"Stored content from {content.url} in {content.content_type.value} store")
            
        except Exception as e:
            logger.error(f"Error storing content: {e}")
    
    def search_content(self, query: str, content_type: ContentType = None, 
                      n_results: int = 5) -> List[Dict]:
        """Search for content in vector stores"""
        query_embedding = self.embedding_model.encode(query).tolist()
        
        if content_type:
            collections = [self.stores[content_type]]
        else:
            collections = list(self.stores.values())
        
        all_results = []
        for collection in collections:
            try:
                results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results
                )
                all_results.extend(results)
            except Exception as e:
                logger.error(f"Error searching collection: {e}")
        
        return all_results

class URLCrawler:
    """Main crawler class that extracts and categorizes content"""
    
    def __init__(self, max_pages: int = 50, delay: float = 1.0):
        self.max_pages = max_pages
        self.delay = delay
        self.visited_urls: Set[str] = set()
        self.classifier = ContentClassifier()
        self.vector_manager = VectorStoreManager()
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)'}
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def _is_valid_url(self, url: str, base_domain: str) -> bool:
        """Check if URL should be crawled"""
        try:
            parsed = urlparse(url)
            # Stay within the same domain
            if parsed.netloc != base_domain:
                return False
            
            # Skip certain file types
            skip_extensions = {'.pdf', '.jpg', '.png', '.gif', '.zip', '.mp4', '.mp3'}
            if any(url.lower().endswith(ext) for ext in skip_extensions):
                return False
            
            return True
        except:
            return False
    
    async def _fetch_page(self, url: str) -> Optional[str]:
        """Fetch a single page"""
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'text/html' in content_type:
                        return await response.text()
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
        return None
    
    def _extract_content(self, html: str, url: str) -> Optional[CrawledContent]:
        """Extract and structure content from HTML"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract title
            title = soup.find('title')
            title_text = title.get_text().strip() if title else ""
            
            # Extract main content
            main_content = ""
            
            # Look for main content areas
            content_selectors = [
                'main', 'article', '.content', '#content',
                '.main-content', '#main-content', '.post-content'
            ]
            
            for selector in content_selectors:
                element = soup.select_one(selector)
                if element:
                    main_content = element.get_text(separator=' ', strip=True)
                    break
            
            # Fallback to body content
            if not main_content:
                body = soup.find('body')
                if body:
                    main_content = body.get_text(separator=' ', strip=True)
            
            # Clean up content
            main_content = ' '.join(main_content.split())
            
            if len(main_content) < 100:  # Skip pages with too little content
                return None
            
            # Extract metadata
            metadata = {}
            
            # Meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                metadata['description'] = meta_desc.get('content', '')
            
            # Meta keywords
            meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
            if meta_keywords:
                metadata['keywords'] = meta_keywords.get('content', '')
            
            # Extract links for further crawling
            links = []
            for link in soup.find_all('a', href=True):
                href = urljoin(url, link['href'])
                links.append(href)
            
            metadata['internal_links'] = links
            metadata['word_count'] = len(main_content.split())
            
            # Classify content
            content_type = self.classifier.classify(url, title_text, main_content)
            
            return CrawledContent(
                url=url,
                title=title_text,
                content=main_content,
                content_type=content_type,
                metadata=metadata,
                timestamp=time.time()
            )
            
        except Exception as e:
            logger.error(f"Error extracting content from {url}: {e}")
            return None
    
    async def crawl_website(self, start_url: str) -> Dict[str, int]:
        """Crawl website starting from the given URL"""
        base_domain = urlparse(start_url).netloc
        urls_to_visit = [start_url]
        content_counts = {ct.value: 0 for ct in ContentType}
        
        logger.info(f"Starting crawl of {start_url}")
        
        while urls_to_visit and len(self.visited_urls) < self.max_pages:
            current_url = urls_to_visit.pop(0)
            
            if current_url in self.visited_urls:
                continue
            
            if not self._is_valid_url(current_url, base_domain):
                continue
            
            logger.info(f"Crawling: {current_url}")
            self.visited_urls.add(current_url)
            
            # Fetch page content
            html = await self._fetch_page(current_url)
            if not html:
                continue
            
            # Extract and classify content
            content = self._extract_content(html, current_url)
            if not content:
                continue
            
            # Store in appropriate vector database
            self.vector_manager.store_content(content)
            content_counts[content.content_type.value] += 1
            
            # Add new URLs to crawl
            if 'internal_links' in content.metadata:
                new_urls = [url for url in content.metadata['internal_links'] 
                           if url not in self.visited_urls 
                           and self._is_valid_url(url, base_domain)]
                urls_to_visit.extend(new_urls[:10])  # Limit new URLs per page
            
            # Rate limiting
            await asyncio.sleep(self.delay)
        
        logger.info(f"Crawl completed. Pages processed: {len(self.visited_urls)}")
        logger.info(f"Content distribution: {content_counts}")
        
        return content_counts

# Usage example and main execution
async def main():
    """Example usage of the crawler system"""
    
    # Initialize crawler
    async with URLCrawler(max_pages=20, delay=1.0) as crawler:
        # Crawl a website
        url_to_crawl = "https://example.com"  # Replace with actual URL
        
        try:
            results = await crawler.crawl_website(url_to_crawl)
            print("Crawling Results:")
            for content_type, count in results.items():
                print(f"  {content_type}: {count} pages")
            
            # Example search
            search_results = crawler.vector_manager.search_content(
                "product information", 
                content_type=ContentType.PRODUCT,
                n_results=3
            )
            
            print(f"\nFound {len(search_results)} product-related results")
            
        except Exception as e:
            logger.error(f"Crawling failed: {e}")

class CrawlerAPI:
    """API wrapper for the crawler system"""
    
    def __init__(self):
        self.active_crawlers = {}
    
    async def start_crawl(self, url: str, user_id: str, 
                         max_pages: int = 50) -> Dict:
        """Start a new crawl job"""
        try:
            crawler = URLCrawler(max_pages=max_pages)
            self.active_crawlers[user_id] = crawler
            
            async with crawler:
                results = await crawler.crawl_website(url)
                
            return {
                "status": "completed",
                "user_id": user_id,
                "url": url,
                "results": results,
                "pages_crawled": len(crawler.visited_urls)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "user_id": user_id,
                "error": str(e)
            }
        finally:
            # Cleanup
            if user_id in self.active_crawlers:
                del self.active_crawlers[user_id]
    
    def search_user_content(self, user_id: str, query: str, 
                           content_type: str = None) -> List[Dict]:
        """Search content for a specific user"""
        # In a real implementation, you'd need to track user-specific stores
        vector_manager = VectorStoreManager()
        
        ct = None
        if content_type:
            try:
                ct = ContentType(content_type)
            except ValueError:
                pass
        
        return vector_manager.search_content(query, ct)

if __name__ == "__main__":
    # Run the example
    asyncio.run(main())