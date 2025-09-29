import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import img1 from "../image/member1.jpg"; // Your existing image
import img2 from "../image/khalid.jpg"; // Add more images as needed
import img3 from "../image/imane.jpg";
import img4 from "../image/yassin.jpg";
import "./MemberCard.css";

export default function MemberCard() {
    // Sample member data (replace with your actual data)
    const members = [
        {
            name: "Khalid",
            description: "The fifth member of the team. He is a software engineer and the manager of the yellow team.",
            img: img2,
        },
        {
            name: "Jane",
            description: "The second member of the team. She is a UI/UX designer and leads the blue team.",
            img: img1,
        },
        {
            name: "yassin",
            description: "The third member of the team. He is a backend developer and manages the green team.",
            img: img4,
        },
        {
            name: "Sara",
            description: "The fourth member of the team. She is a product manager and oversees project timelines.",
            img: img3, // Reuse image for demo
        },
    ];

    useEffect(() => {
        console.log("MemberCard useEffect running");
    }, []);

    return (
        <div className="main-container">
            <Swiper
                className="slide-container mySwiper"
                modules={[Navigation, Pagination]}
                slidesPerView={3}
                slidesPerGroup={3}
                spaceBetween={30}
                loop={true}
                loopFillGroupWithBlank={true} // Ensures groups are filled for infinite loop
                navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }}
                pagination={{
                    el: ".swiper-pagination",
                    clickable: true,
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 1,
                        slidesPerGroup: 1,
                        spaceBetween: 10,
                    },
                    1024: {
                        slidesPerView: 3,
                        slidesPerGroup: 3,
                        spaceBetween: 30,
                    },
                }}
                onSwiper={(swiper) => console.log("Swiper initialized:", swiper)}
                onInit={() => console.log("Swiper component initialized")}
            >
                <div className="slide-content">
                    <div className="card-wrapper swiper-wrapper">
                        {members.map((member, index) => (
                            <SwiperSlide className="card swiper-slide" key={index}>
                                <div className="image-content">
                                    <span className="image-overlay"></span>
                                    <div className="card-image">
                                        <img src={member.img} alt={member.name} className="card-img" />
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h2 className="name">{member.name}</h2>
                                    <p className="description">{member.description}</p>
                                    <button className="button">View More</button>
                                </div>
                            </SwiperSlide>
                        ))}
                    </div>
                </div>
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
                <div className="swiper-pagination"></div>
            </Swiper>
        </div>
    );
}