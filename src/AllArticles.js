import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ArticleCard from './ArticleCard';


const AllArticles = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await axios.get('http://localhost:5000/api/articles/all');
      setArticles(response.data);
    };

    fetchArticles();
  }, []);

  const getThumbnailUrl = (videoUrl) => {
    const videoIdMatch = videoUrl.match(/embed\/([^?]+)/); 
    const videoId = videoIdMatch ? videoIdMatch[1] : null; 
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'default_image.jpg'; 
  };

  return (
    <div className="all-articles">
      <h2>All Courses</h2>
      <div className="card-container">
        {articles.length > 0 ? (
          articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            
          ))
        ) : (
          <p>Loading</p>
        )}
      </div>
    </div>
  );
};

export default AllArticles;