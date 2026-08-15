-- =============================================================================
-- Seed 002: 50 platos sintéticos para el menú del restaurante
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================================

INSERT INTO public.menu (name, price) VALUES
  -- Entradas
  ('Bruschetta al Tomate',          4.50),
  ('Tabla de Quesos Artesanales',   9.90),
  ('Ceviche de Camarón',            8.75),
  ('Alitas BBQ (x6)',               7.50),
  ('Nachos con Guacamole',          6.80),
  ('Carpaccio de Res',             10.50),
  ('Calamares a la Romana',         8.20),
  ('Empanadas de Carne (x3)',        5.90),

  -- Sopas y cremas
  ('Sopa de Tomate con Albahaca',   5.50),
  ('Crema de Champiñones',          6.00),
  ('Consomé de Pollo',              4.80),
  ('Sopa de Cebolla Gratinada',     7.20),

  -- Ensaladas
  ('Ensalada César',                7.50),
  ('Ensalada Caprese',              7.90),
  ('Ensalada Griega',               8.00),
  ('Ensalada Mediterránea',         8.50),
  ('Ensalada de Rúcula y Pera',     9.00),

  -- Pastas
  ('Pasta Carbonara',              12.50),
  ('Fettuccine Alfredo',           11.90),
  ('Lasaña Boloñesa',             13.50),
  ('Ravioles de Ricotta',          12.00),
  ('Penne all''Arrabbiata',        11.00),
  ('Spaghetti Aglio e Olio',       10.50),
  ('Tagliatelle al Pesto',         12.50),

  -- Pizzas
  ('Pizza Margherita',             11.00),
  ('Pizza Cuatro Quesos',          13.50),
  ('Pizza Pepperoni',              12.00),
  ('Pizza Hawaiana',               11.50),
  ('Pizza Funghi',                 12.50),
  ('Pizza Diavola',                13.00),

  -- Carnes
  ('Lomo Saltado',                 16.00),
  ('Filete Mignon 200g',           22.50),
  ('Costillas BBQ',                18.90),
  ('Churrasco a la Parrilla',      19.50),
  ('Hamburguesa Artesanal',        13.00),

  -- Mariscos
  ('Paella de Mariscos (porción)', 18.00),
  ('Salmón a la Plancha',          17.50),
  ('Camarones al Ajillo',          16.50),
  ('Pulpo a la Gallega',           19.00),

  -- Aves
  ('Pollo a la Parrilla',          13.50),
  ('Pechuga Rellena de Espinaca',  15.00),
  ('Pollo al Curry',               14.50),

  -- Vegetariano / Vegano
  ('Bowl de Quinoa y Vegetales',   11.00),
  ('Risotto de Hongos',            13.00),
  ('Tacos de Jackfruit (x3)',      10.50),

  -- Postres
  ('Tiramisú Clásico',              5.50),
  ('Lava Cake de Chocolate',        6.00),
  ('Cheesecake de Frutos Rojos',    6.50),
  ('Panna Cotta de Vainilla',       5.00),
  ('Brownie con Helado',            5.80);
