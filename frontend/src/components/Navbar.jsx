import { NavLink, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import { ShopContext } from "../contexts/ShopContext";

function Navbar() {
	const { token, setToken } = useContext(ShopContext);
	const navigate = useNavigate();

	const [isOpen, setIsOpen] = useState(false);
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
	const profileDropdownRef = useRef(null);

	const logout = () => {
		localStorage.removeItem("token");
		setToken("");
		navigate("/login");
	};

	const toggleProfileDropdown = () => {
		setIsProfileDropdownOpen((prev) => !prev);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				profileDropdownRef.current &&
				!profileDropdownRef.current.contains(event.target)
			) {
				setIsProfileDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const navLinks = [
		{ name: "Home", path: "/" },
		{ name: "EcoCalculator", path: "/eco-calculator" },
		{ name: "EcoShopping", path: "/eco-shop" },
		{ name: "Learn", path: "/learn" },
		{ name: "Initiatives", path: "/initiatives" },
		{ name: "Support", path: "/support" },
		{ name: "Contact", path: "/contact" },
	];

	return (
		<nav className="bg-black border-b px-4 py-3">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<NavLink to="/" className="flex items-center gap-2">
					<img src="/earth.png" alt="logo" className="w-10 h-10" />
					<span style={{ fontFamily: "Pacifico" }} className="text-gray-300 text-lg">
						EcoSphere
					</span>
				</NavLink>

				{/* Mobile Toggler */}
				<button onClick={() => setIsOpen(true)} className="lg:hidden text-gray-300">
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				{/* Desktop Nav */}
				<ul className="hidden lg:flex items-center gap-10 text-sm font-medium">
					{navLinks.map((link) => (
						<li key={link.name}>
							<NavLink
								to={link.path}
								className={({ isActive }) =>
									isActive
										? "text-green-400 font-semibold"
										: "text-gray-300 hover:text-green-400 transition-colors duration-200"
								}
							>
								{link.name}
							</NavLink>
						</li>
					))}
					{token ? (
						<li className="relative" ref={profileDropdownRef}>
							<button
								onClick={toggleProfileDropdown}
								className="flex items-center gap-1 text-gray-300 hover:text-green-400 transition duration-200"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<svg
									className={`w-4 h-4 transition-transform duration-200 ${
										isProfileDropdownOpen ? "rotate-180" : ""
									}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Dropdown */}
							{isProfileDropdownOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-600">
									<ul className="py-1 text-sm text-gray-300">
										<li>
											<NavLink
												to="/profile"
												onClick={() => setIsProfileDropdownOpen(false)}
												className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 hover:text-green-400"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
													/>
												</svg>
												My Profile
											</NavLink>
										</li>
										<li>
											<NavLink
												to="/cart"
												onClick={() => setIsProfileDropdownOpen(false)}
												className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 hover:text-green-400"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
													/>
												</svg>
												My Cart
											</NavLink>
										</li>
										<li>
											<NavLink
												to="/myorders"
												onClick={() => setIsProfileDropdownOpen(false)}
												className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 hover:text-green-400"
											>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 8h14l1 12H4L5 8zm7-4a4 4 0 00-4 4v0a4 4 0 008 0v0a4 4 0 00-4-4z"
										/>
									</svg>
												My Orders
											</NavLink>
										</li>
										<hr className="border-gray-600 my-1" />
										<li>
											<button
												onClick={() => {
													logout();
													setIsProfileDropdownOpen(false);
												}}
												className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M17 16l4-4m0 0l-4-4m4 4H7"
													/>
												</svg>
												Logout
											</button>
										</li>
									</ul>
								</div>
							)}
						</li>
					) : (
						<>
							<li>
								<NavLink
									to="/login"
									className={({ isActive }) =>
										isActive ? "text-green-400 font-semibold" : "text-gray-300 hover:text-green-400"
									}
								>
									Login
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/signup"
									className={({ isActive }) =>
										isActive ? "text-green-400 font-semibold" : "text-gray-300 hover:text-green-400"
									}
								>
									Signup
								</NavLink>
							</li>
						</>
					)}
				</ul>
			</div>

			{/* Mobile Modal */}
			{isOpen && (
				<div className="fixed inset-0 z-50 bg-green-800 bg-opacity-95 flex items-center justify-center">
					<button
						onClick={() => setIsOpen(false)}
						className="absolute top-4 right-4 text-white hover:text-gray-200"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
					<ul className="flex flex-col gap-6 text-center text-white text-lg font-medium">
						{navLinks.map((link) => (
							<li key={link.name}>
								<NavLink
									to={link.path}
									onClick={() => setIsOpen(false)}
									className={({ isActive }) =>
										isActive ? "text-lime-300 font-semibold" : "hover:text-lime-300"
									}
								>
									{link.name}
								</NavLink>
							</li>
						))}
						{token ? (
							<>
								<li>
									<NavLink
										to="/profile"
										onClick={() => setIsOpen(false)}
										className="hover:text-lime-300"
									>
										My Profile
									</NavLink>
								</li>
								<li>
									<NavLink
										to="/cart"
										onClick={() => setIsOpen(false)}
										className="hover:text-lime-300"
									>
										My Cart
									</NavLink>
								</li>
								<li>
									<NavLink
										to="/myorders"
										onClick={() => setIsOpen(false)}
										className="hover:text-lime-300"
									>
										My Orders
									</NavLink>
								</li>
								<li>
									<button
										onClick={() => {
											logout();
											setIsOpen(false);
										}}
										className="text-red-300 hover:text-red-400"
									>
										Logout
									</button>
								</li>
							</>
						) : (
							<>
								<li>
									<NavLink
										to="/login"
										onClick={() => setIsOpen(false)}
										className="hover:text-lime-300"
									>
										Login
									</NavLink>
								</li>
								<li>
									<NavLink
										to="/signup"
										onClick={() => setIsOpen(false)}
										className="hover:text-lime-300"
									>
										Signup
									</NavLink>
								</li>
							</>
						)}
					</ul>
				</div>
			)}
		</nav>
	);
}

export default Navbar;
