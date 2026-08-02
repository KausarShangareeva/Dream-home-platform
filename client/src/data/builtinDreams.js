import carImg from '../assets/dream-car.jpg';
import garageImg from '../assets/dream-garage.jpg';
import coffeeImg from '../assets/dream-coffee2.jpg';
import treeImg from '../assets/dream-tree2.jpg';
import beesImg from '../assets/dream-bees2.jpg';
import chickenImg from '../assets/dream-chicken.jpg';
import catImg from '../assets/dream-cat3.jpg';
import goatImg from '../assets/dream-goat2.jpg';
import cowImg from '../assets/dream-cow.jpg';
import horseImg from '../assets/dream-horse.jpg';
import treehouseImg from '../assets/dream-treehouse.jpg';

// The original 11 built-in dream cards, with their real photos.
// `pos` matches the original's per-photo object-position, so faces/subjects aren't cropped oddly.
export const BUILTIN_DREAMS = [
  { id: 'car', title: 'Машина', target: 150000, photo: carImg, pos: 'center 65%' },
  { id: 'garage', title: 'Гараж', target: 150000, photo: garageImg, pos: 'center 45%' },
  { id: 'coffee', title: 'Большая кофемашина', target: 15000, photo: coffeeImg, pos: 'center 35%' },
  { id: 'trees', title: 'Фруктовые деревья для сада', target: 5000, photo: treeImg, pos: 'center 50%' },
  { id: 'bees', title: 'Улей (пчёлы)', target: 10000, photo: beesImg, pos: 'center 55%' },
  { id: 'chickens', title: 'Куры', target: 6000, photo: chickenImg, pos: 'center 15%' },
  { id: 'cats', title: 'Две кошки', target: 3000, photo: catImg, pos: 'center' },
  { id: 'goat', title: 'Коза', target: 6000, photo: goatImg, pos: 'center' },
  { id: 'cow', title: 'Корова', target: 25000, photo: cowImg, pos: 'center 35%' },
  { id: 'horse', title: 'Конь', target: 45000, photo: horseImg, pos: 'center 35%' },
  { id: 'treehouse', title: 'Дом на дереве для детей', target: 35000, photo: treehouseImg, pos: 'center 25%' },
];
