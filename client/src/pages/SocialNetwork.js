import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Bell, 
  Plus, 
  Heart, 
  MessageCircle, 
  Users, 
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Pin,
  Lock,
  Eye,
  ThumbsUp,
  Reply
} from 'lucide-react';

const SocialNetwork = () => {
  const [activeTab, setActiveTab] = useState('forums');
  const [forums, setForums] = useState([]);
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedForum, setSelectedForum] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const tabs = [
    { id: 'forums', name: 'Forums', icon: MessageSquare },
    { id: 'announcements', name: 'Announcements', icon: Bell },
    { id: 'events', name: 'Events', icon: Calendar }
  ];

  const forumCategories = [
    'general', 'academic', 'sports', 'events', 'announcements', 'discussions'
  ];

  const eventTypes = [
    'academic', 'sports', 'cultural', 'social', 'meeting', 'celebration'
  ];

  const priorityLevels = ['low', 'medium', 'high', 'urgent'];

  useEffect(() => {
    fetchForums();
    fetchAnnouncements();
    fetchEvents();
  }, []);

  const fetchForums = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/forums');
      const data = await response.json();
      if (data.status === 'success') {
        setForums(data.data.forums);
      }
    } catch (error) {
      console.error('Error fetching forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/announcements');
      const data = await response.json();
      if (data.status === 'success') {
        setAnnouncements(data.data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/events');
      const data = await response.json();
      if (data.status === 'success') {
        setEvents(data.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForumPosts = async (forumId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/social/forums/${forumId}/posts`);
      const data = await response.json();
      if (data.status === 'success') {
        setPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForumSelect = (forum) => {
    setSelectedForum(forum);
    fetchForumPosts(forum.id);
  };

  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || forum.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderForums = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Forums</h2>
        <button
          onClick={() => { setModalType('forum'); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Forum
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {forumCategories.map(category => (
            <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForums.map((forum) => (
          <div key={forum.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {forum.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  forum.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {forum.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{forum.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{forum.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Created by {forum.creator?.firstName} {forum.creator?.lastName}</span>
                <span>{new Date(forum.createdAt).toLocaleDateString()}</span>
              </div>
              
              <button
                onClick={() => handleForumSelect(forum)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                View Forum
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedForum && (
        <div className="mt-8">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900">{selectedForum.title}</h3>
            <p className="text-blue-700 text-sm">{selectedForum.description}</p>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Posts</h4>
            <button
              onClick={() => { setModalType('post'); setShowModal(true); }}
              className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Post
            </button>
          </div>
          
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {post.creator?.firstName?.[0]}{post.creator?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{post.title}</h5>
                      <p className="text-sm text-gray-500">
                        by {post.creator?.firstName} {post.creator?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                    {post.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Reply className="h-4 w-4" />
                      {post.replyCount}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
        <button
          onClick={() => { setModalType('announcement'); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            announcement.priority === 'urgent' ? 'border-red-500' :
            announcement.priority === 'high' ? 'border-orange-500' :
            announcement.priority === 'medium' ? 'border-yellow-500' :
            'border-green-500'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                <p className="text-gray-700">{announcement.content}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {announcement.priority}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Target: {announcement.targetAudience}</span>
                <span>By: {announcement.creator?.firstName} {announcement.creator?.lastName}</span>
              </div>
              <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Events</h2>
        <button
          onClick={() => { setModalType('event'); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {event.eventType}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  event.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.maxAttendees && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>Max {event.maxAttendees} attendees</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                  Register
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Network</h1>
        <p className="text-gray-600">Connect, share, and engage with the school community</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'forums' && renderForums()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'events' && renderEvents()}
        </>
      )}
    </div>
  );
};

export default SocialNetwork;
