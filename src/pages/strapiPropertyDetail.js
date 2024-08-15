import React, { useState, useEffect } from 'react';
import { useLocation } from '@reach/router'; // Use @reach/router for Gatsby projects
import Layout from "../components/layout";
import CircularProgress from '@mui/material/CircularProgress';
import amenityImages from "../jsonFolder/amenities.json"
import Seo from '../components/seo';
import Box from '@mui/material/Box';
import axios from 'axios'; // Import Axios
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'react-modal'; // Import Modal from 'react-modal'
import Successfully from "../jsonFolder/Successfully.json"
import Fail from "../jsonFolder/Fail.json"
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import "../components/style/PropertiesDetail.css";


const StrapiPropertyDetail = () => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');  // Correctly getting 'id' from query params
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);  // Added state for gallery modal
  const [isAmenitiesExpanded, setIsAmenitiesExpanded] = useState(false); // Added state for amenities
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '',
    propertyid: id,
    email:''
    });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(false);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCheckIn(today);
    setCheckOut(today);
    const fetchData = async () => {
      try {
        console.log(id); // Log the ID to check it
        const url = `https://restnest-strapi.softylus.com/api/propertieses/${id}?populate[amenities]=*&populate[imageurl]=*`; // Use the 'id' from URL directly
        const options = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer a8f43ba097ef669aa5e1d417aed535940b7753d38525986376704e2aab5e5bcbcebc8b463ea42f03a3da4eda7cf7c46e803ba6b3eae983da826e721d5e1048da3b40e0b2523d577166fa3ad18efd8aae97da54631a4ff7665369382e8b5304f42f0138c68ca415e5bd953e02c0c42d3de11d741fc8b0f44bf119043363c6bfdb'
          }
        };
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Network response was not OK, status: ${response.status}`);
        }
        const data = await response.json();
        setProperty(data.data.attributes);  // Assuming the data structure includes data.attributes
      } catch (err) {
        setError(`Failed to fetch property: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);  // React to changes in 'id'

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };
  const toggleAmenities = () => {
    setIsAmenitiesExpanded(!isAmenitiesExpanded);
  };

  // Function to handle change in check-in date
  const handleCheckInChange = (event) => {
    const { value } = event.target;
    const today = new Date().toISOString().split('T')[0]; // Get today's date
    setCheckIn(value);
    console.log("date :"+value)
    // Update minimum date for check-out to prevent selecting past dates
    if (value < today) {
      setCheckOut(today); // If selected date is before today, set check-out date to today
    } else {
      setCheckOut(value); // Otherwise, keep check-out date same as selected check-in date
    }
  };
  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
  };
  // Function to handle change in check-out date
  const handleCheckOutChange = (event) => {
    
    const { value } = event.target;
    setCheckOut(value);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Send the empty object as payload
      const response = await axios.post(
        "https://restnest-strapi.softylus.com/api/properties-forms",
        {
          data: {
              checkIn: formData.checkIn,
              checkOut: formData.checkOut,
              guests: formData.guests,
              propertyid: formData.propertyid,
              email: formData.email
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer a8f43ba097ef669aa5e1d417aed535940b7753d38525986376704e2aab5e5bcbcebc8b463ea42f03a3da4eda7cf7c46e803ba6b3eae983da826e721d5e1048da3b40e0b2523d577166fa3ad18efd8aae97da54631a4ff7665369382e8b5304f42f0138c68ca415e5bd953e02c0c42d3de11d741fc8b0f44bf119043363c6bfdb"
          }
        }
      );
  
      if (response.status === 200) {
        console.log(response, ' rewre')
        setFormSubmitted(true);
        setShowSuccessPopup(true);
        // Clear the form data after successful submission
        setFormData({
          checkIn: '',
          checkOut: '',
          guests: '',
          propertyid: id,
          email:''
          
        });
        console.log("date"+formData);
      } else {
        setFormError(true);
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setFormError(true);
      setShowErrorPopup(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!property) {
    return <div>No property found.</div>;
  }

  // Define description display logic
  const description = property.description || '';
  const descriptionLines = description.split('\n');
  const shouldShowReadMoreDescription = descriptionLines.length > 8;
  const displayDescription = isDescriptionExpanded ? descriptionLines : descriptionLines.slice(0, 8);
  
  const amenities = Array.isArray(property?.amenities?.data)
  ? property.amenities.data.map(amenity => amenity.attributes.amenity_name)
  : [];
const shouldShowReadMoreAmenities = amenities.length > 12;
const displayAmenities = isAmenitiesExpanded ? amenities : amenities.slice(0, 12);

console.log(amenities,"amenities");

  return (
    <Layout>
      <Seo title={property.name}/>
      <section className='image-sec-det'>
        <div className='image-container-det'>  
          <div className="image-list-inner">
            <div className='Big-image-d'>
            {property.imageurl?.data?.length > 0 && (
                <img src={`https://restnest-strapi.softylus.com/${property.imageurl.data[0].attributes.url}`} alt=""  />
              )}
              <button className="view-all-photos" onClick={() => setIsGalleryOpen(true)}>
                View All Photos
              </button>
              {isGalleryOpen && (
  <div className="gallery-modal" onClick={() => setIsGalleryOpen(false)}>
    <div className="gallery-content" onClick={e => e.stopPropagation()}>
    {property.imageurl?.data?.length && property.imageurl.data.map((image, index) => (
        <img key={index} src={`https://restnest-strapi.softylus.com/${image.attributes.url}`} alt={`Image ${index + 1}`} />
      ))}
    </div>
  </div>
)}
</div>

          <div className='small-image-d'>
          {property.imageurl?.data?.slice(1, 5).map((image, index) => {
        const borderRadiusStyle = index === 1
          ? { borderRadius: '0 10px 0 0' }
          : index === 3
          ? { borderRadius: '0 0 10px 0' }
          : {};
        return (
          <div className={`listing-image-container-list${index === 0 ? ' separate-div' : ''}`} key={index}>
            {image.attributes &&
              <img
                src={`https://restnest-strapi.softylus.com/${image.attributes.url}`}
                alt={`Image ${index + 2}`}
                className="listing-image-list"
                style={borderRadiusStyle}
              />
            }
          </div>
        );
      })}
                    </div>
          </div>
        </div>
      </section>
      <section className='detail-pro-sec'>
        <div className='detail-pro-container'>
          <div className='detail-pro-des'>
            <h1>{property.name}</h1>
            <h6>House in {property.city}, {property.state}</h6>
            <div className='card-des-detail'>
              <span><img src='/bed-solid 1.svg' alt="Bedrooms" /> {property.bedrooms}</span>
              <span><img src='/bath-solid 1.svg' alt="Bathrooms" /> {property.bathroomsNumber}</span>
              <span><img src='/users-solid 1.svg' alt="Guests" /> {property.guests}</span>
              <span><img src='/ruler-combined-solid 1.svg' alt="Area" /> {property.squareMeters ? `${property.squareMeters}m²` : 'N/A'}</span>
            </div>
            <h2>About this space</h2>
            {displayDescription.map((line, index) => (
      <p key={index} className='space-detail'>
        {line}
        {index !== displayDescription.length - 1 && <br />} {/* Add <br /> except for the last line */}
      </p>
    ))}
            <div className='space-for-space'></div>
            {shouldShowReadMoreDescription && (
              <span id="toggleButton" onClick={toggleDescription}>
                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
              </span>
            )}
           <h2>Amenities</h2>
              <div className="amenities-list">
                <div className='amenity-detail'>
                  {displayAmenities.map((amenities, index) => {
                    const icon = amenityImages[amenities]; // Use amenity.amenity_name to access the amenity name

                    return (
                      <div key={index} className='amenity-detail-single'>
                         <i className={"fa " + icon}></i>
                          {icon && <FontAwesomeIcon icon={['fas', icon]} />}
                        <p className='amenity-single-detail'>{amenities}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {shouldShowReadMoreAmenities && (
                <span id="toggleButton" onClick={toggleAmenities}>
                  {isAmenitiesExpanded ? 'Show Less' : 'Show More'}
                </span>
              )}
          </div>
          <div className="pay-detail">
            <form onSubmit={handleSubmit}>
              <div className='form-data'>
                <div className="form-group">
                  <label htmlFor="checkIn">Check In</label>
                  <input 
                  required
                    type="date" 
                    className="form-control" 
                    id="checkIn" 
                    name="checkIn" 
                    placeholder="Check In" 
                    min={checkIn} 
                    value={formData.checkIn} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkOut">Check Out</label>
                  <input 
                  required
                    type="date" 
                    className="form-control" 
                    id="checkOut" 
                    name="checkOut" 
                    placeholder="Check Out" 
                    value={formData.checkOut} 
                    min={checkOut && formData.checkIn} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className='form-data'>
              <div className="form-group">
                <label htmlFor="guests">Guests</label>
                <input type="number"  id="guests" placeholder="1" min="1" max="100" value={formData.guests} onChange={handleChange} required  name="guests" />
              </div>
              <div className="form-group">
                <label htmlFor="guests">Email</label>
                <input type="email"  id="email" placeholder="Example@"  value={formData.email} onChange={handleChange} required  name="email" />
              </div>
              </div>
              <button type="submit" className="btn btn-primary">Send Inquiry</button> 
              
            </form>
            <div>
            <Modal isOpen={formSubmitted || formError} onRequestClose={() => {setFormSubmitted(false); setFormError(false);}}>
        {formSubmitted ? (
          <div className='Contact-successfuly'>
            <button onClick={() => {setFormSubmitted(false);}}><img src='/close.svg'/></button>
            <div className='Contact-successfuly-body'> 
              <Player
                autoplay
                loop
                src={Successfully} 
                style={{ height: '200px', width: '200px' }} 
              >
                <Controls visible={false} buttons={['play', 'repeat', 'frame', 'debug']} />
              </Player>  
              <h4>Success! Your inquiry has been sent.</h4>
            </div>
          </div>
        ) : (
          <div className='Contact-error'>
            <button onClick={() => {setFormError(false);}}><img src='/close.svg'/></button>
            <div className='Contact-error-body'>
              <Player
                autoplay
                loop
                src={Fail} 
                style={{ height: '200px', width: '200px' }} 
              >
                <Controls visible={false} buttons={['play', 'repeat', 'frame', 'debug']} />
              </Player>  
              <h4>Error! Failed to send your inquiry.</h4>
            </div>
          </div>
        )}
      </Modal>
            </div>
          </div>
        </div>
      </section>
      {/* <section className='map-detail'>
        <div className='map-detail-des'>
          <h2>Property location</h2>

        </div>
      </section> */}
      <section className='checkout-mobile-sec'>
        <div className='checkout-mobile-container'>
        <div className="form-group form-group-mobile ">
        
          <form className='check-in-out-mob-container'  onSubmit={handleSubmit}>
          <div className='check-in-out-mob' onClick={() => document.querySelector('.check-in-out-mob .react-datepicker-wrapper input')}>
          <div className='form-data'>
                <div className="form-group">
                  <label htmlFor="checkIn">Check In</label>
                  <input 
                  required
                    type="date" 
                    className="form-control" 
                    id="checkIn" 
                    name="checkIn" 
                    placeholder="Check In" 
                    min={checkIn} 
                    value={formData.checkIn} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkOut">Check Out</label>
                  <input 
                  required
                    type="date" 
                    className="form-control" 
                    id="checkOut" 
                    name="checkOut" 
                    placeholder="Check Out" 
                    value={formData.checkOut} 
                    min={checkOut && formData.checkIn} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className='form-data'>
              <div className="form-group">
                <label htmlFor="guests">Guests</label>
                <input type="number" required  id="guests" placeholder="1" min="1" max="100" value={formData.guests} onChange={handleChange}  name="guests" />
              </div>
              <div className="form-group">
                <label htmlFor="guests">Email</label>
                <input type="email"  id="email" required placeholder="1" min="1" max="100" value={formData.email} onChange={handleChange}  name="email" />
              </div>
              </div>
              </div>
              <button type="submit" className="btn btn-primary">Send Inquiry</button> 

         </form>
    </div>
        </div>
       
      </section>
    </Layout>
  );
};

export default StrapiPropertyDetail;
