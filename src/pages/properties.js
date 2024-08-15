import React, { useState, useEffect } from 'react';
import { Link } from "gatsby";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LazyLoad from 'react-lazyload';
import Layout from "../components/layout";
import Form from '../components/Form';
import Seo from '../components/seo';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "../components/style/Properties.css";
import StrapiPropertyDetail from './StrapiPropertyDetail';

const Properties = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  
  const [areListingsEmpty, setAreListingsEmpty] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    numAdults: 0,
    numChildren: 0,
    city: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    const { startDate, endDate, numAdults, numChildren, city } = filter;
    const totalGuests = numAdults + numChildren;
  
    try {
      const responses = await Promise.all([
        fetch('https://api.hostaway.com/v1/listings', {
          headers: new Headers({
            'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1ODYyMCIsImp0aSI6ImMyZmI1YjRiM2UxOGIyNWE0N2IwYWU5MmRiZDRlMjljNGY2MTg3MDRlY2M5MWM5ZTA5MDJlYzg4MWMzMjc4Y2MwOTZiODlkYjA0Y2ZmMjE3IiwiaWF0IjoxNjgwMjAxODE3LCJuYmYiOjE2ODAyMDE4MTcsImV4cCI6MTc0MzM2MDIxNywic3ViIjoiIiwic2NvcGVzIjpbImdlbmVyYWwiXSwic2VjcmV0SWQiOjEzNzAyfQ.ILnp24OkuH18ylsP6DDMWYX11fywUNi1XU_D5iPfpuDOFLpW4tcEQHlaYb94u8O3pERnv1iYENz_KPT6WGI6qFhL-gBA_tM10GWhJuZrSukIJYDWyv7x-WWsmfpUMcsvcQYXyWksAWY-wcCS4RmFtVIw0KWtVGJMy_h_yRs8Ypw`
          })
        }),
        fetch(`https://restnest-strapi.softylus.com/api/propertieses?populate[amenities]=*&populate[imageurl]=*`, {
          method: 'GET',
          headers: new Headers({
            'Authorization': `Bearer a8f43ba097ef669aa5e1d417aed535940b7753d38525986376704e2aab5e5bcbcebc8b463ea42f03a3da4eda7cf7c46e803ba6b3eae983da826e721d5e1048da3b40e0b2523d577166fa3ad18efd8aae97da54631a4ff7665369382e8b5304f42f0138c68ca415e5bd953e02c0c42d3de11d741fc8b0f44bf119043363c6bfdb`,
            'Content-Type': 'application/json'
          })
        })
      ]);
  
      const data = await Promise.all(responses.map(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      }));
  
      const combinedData = [
        ...data[0].result.map(item => ({ ...item, source: 'hostaway' })),
        ...data[1].data.map(item => ({ ...item, source: 'strapi' }))
      ];
      setListings(combinedData);
      setAreListingsEmpty(combinedData.length === 0);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (startDate, endDate, numAdults, numChildren, city) => {
    setFilter({ startDate, endDate, numAdults, numChildren, city });
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Layout>
      <Seo title="Premier Luxury Rentals in Kelowna, Whistler, Vancouver"
        description="Explore our handpicked selection of luxury rental properties across British Columbia. From waterfront grandeur to serene poolside retreats, find your perfect getaway with exclusive amenities and breathtaking views."/>
      <section className='form-property'>
        <Form onFilter={handleFilter} />
      </section>
      <section className='properties-sec'>
        <div className="properties-container">
        {areListingsEmpty ? (
            <div className='not-found-elements'>
              <img src='/Frame 48096312141414.svg' alt="No properties found" />
              <p>The property you are looking for is not available.<br />Please feel free to search another property :)</p>
            </div>
          ) : (
            listings.map((listing, index) => (
              <div className="property-card" key={index}>
                <Link to={listing.source === 'hostaway' ? `/PropertiesDetail/?listingMapId=${listing.id}` : `/strapiPropertyDetail/?id=${listing.id}`}>

                  <Swiper
                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                    spaceBetween={50}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                  >
                   {listing.source === 'hostaway' && listing.listingImages?.length ? (
                      listing.listingImages.map((image, imageIndex) => {
                        const listingId = listing.id;
                        const mediumUrl = image.attributes?.formats?.medium?.url || '';
                        let defaultImage = image.url||`https://restnest-strapi.softylus.com/${mediumUrl}` ;

                       

                        if (imageIndex === 0) {
                          switch (listingId) {
                            case 152960:
                              defaultImage = '/Waterfront Grandeur.jpg';
                              break;
                            case 162405:
                              defaultImage = '/Serenity Poolside Retreat.jpg';
                              break;
                            case 162409:
                              defaultImage = '/Waterfront Splendor.jpg';
                              break;
                            case 162410:
                              defaultImage = '/Okanagan Valley Villa.jpg';
                              break;
                            case 162411:
                              defaultImage = '/Zenith Bluff.jpeg';
                              break;
                            case 165599:
                              defaultImage = '/Casa Lakeview.jpeg';
                              break;
                            case 168852:
                              defaultImage = '/Catbird House.jpeg';
                              break;
                            case 174759:
                              defaultImage = '/Country_Home_near.jpg';
                              break;
                            case 180624:
                              defaultImage = '/Downtown Delight.jpg';
                              break;
                            case 193813:
                              defaultImage = '/Alpine Elegance Estate.jpg';
                              break;
                            case 193828:
                              defaultImage = '/Santorini Skies Lakehouse.jpeg';
                              break;
                            case 245619:
                              defaultImage = '/Serene Lakefront Haven_ 4BR.jpg';
                              break;
                            default:
                              defaultImage = image.url;
                              break;
                          }
                          return (
                            <SwiperSlide key={image.id || imageIndex} className='properties-slide'>
                              <LazyLoad height={200} once>
                                <img src={defaultImage} alt={listing.listingImages[0]?.caption} />
                              </LazyLoad>
                            </SwiperSlide>
                          );
                        } else {
                          return (
                            <SwiperSlide key={image.id || imageIndex} className='properties-slide'>
                              <LazyLoad height={200} once>
                                <img src={defaultImage} alt={image.caption || 'Property image'} />
                              </LazyLoad>
                            </SwiperSlide>
                          );
                        }
                      })
                    ) : listing.attributes.imageurl?.data?.length ? (
                      listing.attributes.imageurl.data.map((image, imageIndex) => {
                        const mediumUrl = image.attributes.formats.medium.url;

                        return (
                          <SwiperSlide key={image.id || imageIndex} className='properties-slide'>
                            <LazyLoad height={200} once>
                              <img src={image.url||`https://restnest-strapi.softylus.com/${mediumUrl}`} alt={image.attributes.caption || 'Property image'} />
                            </LazyLoad>
                          </SwiperSlide>
                        );
                      })
                    ) : (
                      <SwiperSlide className='properties-slide'>
                        <LazyLoad height={200} once>
                          <img src='/default-image.jpg' alt="Default property" />
                        </LazyLoad>
                      </SwiperSlide>
                    )}
                  </Swiper>
                  <div className='properties-card-des'>
                    <h3>{listing.name || (listing.attributes && listing.attributes.name)}</h3>
                    <div className='card-des'>
                      <span><img src='/bed-solid 1.svg' alt="bed" />  {listing.bedroomsNumber || (listing.attributes && listing.attributes.bedrooms)}</span>
                      <span><img src='/bath-solid 1.svg' alt="bath" />   {listing.bathroomsNumber || (listing.attributes && listing.attributes.bathroomsNumber)}</span>
                      <span><img src='/users-solid 1.svg' alt="guests" />   {listing.guestsIncluded || (listing.attributes && listing.attributes.guests)}</span>
                      <span><img src='/ruler-combined-solid 1.svg' alt="area" />   {(listing.squareMeters || listing.attributes?.squareMeters) ? `${listing.squareMeters || listing.attributes.squareMeters}m²` : 'N/A'}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
};
export default Properties;